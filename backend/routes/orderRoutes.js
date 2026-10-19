import express from "express";
import asyncHandler from "express-async-handler";
import Order, { KITCHEN_STATUS_LIST } from "../models/Order.js";
import Product from "../models/Product.js";
import Promo from "../models/Promo.js";
import generateOrderId from "../utils/generateOrderId.js";
import { checkConnection, createSnapTransaction, verifySignature } from "../utils/midtrans.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

const TAX_RATE = 0.1; // PB1 10%
const DELIVERY_FEE = 9000;

// POST /api/orders  — create order. Prices are recalculated server-side,
// mirroring the "Total dihitung ulang oleh server — aman dari manipulasi harga" note.
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { customerName, phone, items, orderType, notes, promoCode } = req.body;

    if (!customerName || !phone || !items?.length) {
      res.status(400);
      throw new Error("Nama, nomor WhatsApp, dan item pesanan wajib diisi");
    }

    let subtotal = 0;
    const resolvedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        res.status(400);
        throw new Error(`Produk tidak tersedia: ${item.name || item.productId}`);
      }

      const sizeObj = product.sizes.find((s) => s.name === item.size);
      const sizeExtra = sizeObj ? sizeObj.extraPrice : 0;

      const chosenToppings = item.toppings || [];
      const toppingsTotal = chosenToppings.reduce((sum, tName) => {
        const t = product.toppings.find((pt) => pt.name === tName);
        return sum + (t ? t.price : 0);
      }, 0);

      const unitPrice = product.basePrice + sizeExtra + toppingsTotal;
      const qty = item.qty || 1;
      const lineTotal = unitPrice * qty;
      subtotal += lineTotal;

      resolvedItems.push({
        product: product._id,
        name: product.name,
        size: item.size,
        ice: item.ice,
        sweetness: item.sweetness,
        toppings: chosenToppings,
        qty,
        unitPrice,
        lineTotal,
      });

      product.soldCount += qty;
      await product.save();
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const deliveryFee = orderType === "delivery" ? DELIVERY_FEE : 0;

    let discount = 0;
    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), isActive: true });
      if (promo && subtotal >= promo.minSubtotal) {
        discount =
          promo.type === "percent"
            ? Math.round((subtotal * promo.value) / 100)
            : promo.value;
        if (promo.type === "percent" && promo.maxDiscount) {
          discount = Math.min(discount, promo.maxDiscount);
        }
        discount = Math.min(discount, subtotal);
      }
    }

    const total = subtotal + tax + deliveryFee - discount;

    let orderId = generateOrderId();
    // ensure uniqueness (extremely unlikely collision, but cheap to check)
    while (await Order.findOne({ orderId })) {
      orderId = generateOrderId();
    }

    const order = await Order.create({
      orderId,
      customerName,
      phone,
      items: resolvedItems,
      orderType: orderType || "pickup",
      notes: notes || "",
      subtotal,
      tax,
      deliveryFee,
      discount,
      promoCode: promoCode || null,
      total,
    });

    res.status(201).json(order);
  })
);

// GET /api/orders/payment-config — Midtrans connection status + client key for Snap
router.get(
  "/payment-config",
  asyncHandler(async (req, res) => {
    const status = await checkConnection();
    res.json({
      ready: status.ready,
      reason: status.reason,
      clientKey: status.ready ? process.env.MIDTRANS_CLIENT_KEY : null,
      snapJsUrl:
        process.env.MIDTRANS_IS_PRODUCTION === "true"
          ? "https://app.midtrans.com/snap/snap.js"
          : "https://app.sandbox.midtrans.com/snap/snap.js",
    });
  })
);

// POST /api/orders/:orderId/pay — create Midtrans Snap transaction for an order
router.post(
  "/:orderId/pay",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) {
      res.status(404);
      throw new Error("Pesanan tidak ditemukan");
    }
    if (order.paymentStatus === "paid") {
      res.status(400);
      throw new Error("Pesanan ini sudah dibayar");
    }

    // Midtrans requires a unique order_id per transaction attempt
    const midtransOrderId = `${order.orderId}-${Date.now()}`;
    const snap = await createSnapTransaction({
      transaction_details: { order_id: midtransOrderId, gross_amount: order.total },
      customer_details: { first_name: order.customerName, phone: order.phone },
      item_details: [
        ...order.items.map((i, idx) => ({
          id: `item-${idx + 1}`,
          name: i.name.slice(0, 50),
          price: i.unitPrice,
          quantity: i.qty,
        })),
        ...(order.tax ? [{ id: "tax", name: "PB1 10%", price: order.tax, quantity: 1 }] : []),
        ...(order.deliveryFee
          ? [{ id: "delivery", name: "Ongkir", price: order.deliveryFee, quantity: 1 }]
          : []),
        ...(order.discount
          ? [{ id: "discount", name: "Diskon", price: -order.discount, quantity: 1 }]
          : []),
      ],
      callbacks: { finish: `${process.env.CLIENT_URL}/lacak?order=${order.orderId}` },
    });

    order.midtransOrderId = midtransOrderId;
    await order.save();
    res.json({ token: snap.token, redirectUrl: snap.redirect_url });
  })
);

// POST /api/orders/notification — Midtrans webhook (payment notification)
router.post(
  "/notification",
  asyncHandler(async (req, res) => {
    if (!verifySignature(req.body)) {
      res.status(403);
      throw new Error("Signature tidak valid");
    }
    const { order_id, transaction_status, fraud_status, transaction_id } = req.body;
    const order = await Order.findOne({ midtransOrderId: order_id });
    if (!order) {
      res.status(404);
      throw new Error("Pesanan tidak ditemukan");
    }

    let paymentStatus = order.paymentStatus;
    if (transaction_status === "settlement" || (transaction_status === "capture" && fraud_status !== "challenge")) {
      paymentStatus = "paid";
    } else if (["deny", "cancel", "expire", "failure"].includes(transaction_status)) {
      paymentStatus = "failed";
    }
    order.paymentStatus = paymentStatus;
    order.midtransTransactionId = transaction_id;
    await order.save();
    res.json({ ok: true });
  })
);

// GET /api/orders/:orderId — public order tracking by orderId (e.g. KPK-XXXXXXXX)
router.get(
  "/:orderId",
  asyncHandler(async (req, res) => {
    const order = await Order.findOne({ orderId: req.params.orderId.toUpperCase() });
    if (!order) {
      res.status(404);
      throw new Error("Pesanan tidak ditemukan. Periksa kembali ID pesananmu.");
    }
    res.json(order);
  })
);

// GET /api/orders — admin: list all orders, newest first
router.get(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  })
);

// PATCH /api/orders/:id/status — admin: update kitchen status
router.patch(
  "/:id/status",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const { kitchenStatus } = req.body;
    if (!KITCHEN_STATUS_LIST.includes(kitchenStatus)) {
      res.status(400);
      throw new Error("Status dapur tidak valid");
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { kitchenStatus },
      { new: true }
    );
    if (!order) {
      res.status(404);
      throw new Error("Pesanan tidak ditemukan");
    }
    res.json(order);
  })
);

// PATCH /api/orders/:id/payment — admin or webhook: mark payment status
router.patch(
  "/:id/payment",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) {
      res.status(404);
      throw new Error("Pesanan tidak ditemukan");
    }
    res.json(order);
  })
);

export default router;
