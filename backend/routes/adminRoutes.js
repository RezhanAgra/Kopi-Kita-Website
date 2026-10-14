import express from "express";
import asyncHandler from "express-async-handler";
import ExcelJS from "exceljs";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import generateToken from "../utils/generateToken.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/admin/login — simple credential check against .env values
// (For a real deployment, swap this for the Admin model + bcrypt.)
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;
    if (
      username === process.env.ADMIN_USERNAME &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = generateToken({ username });
      return res.json({ username, token });
    }
    res.status(401);
    throw new Error("Username atau password salah");
  })
);

// GET /api/admin/stats — dashboard summary cards + charts
router.get(
  "/stats",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const paidOrders = await Order.find({ paymentStatus: "paid" });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    const pendingCount = await Order.countDocuments({
      kitchenStatus: { $ne: "selesai" },
    });
    const activeProducts = await Product.countDocuments({ isActive: true });

    // revenue for the last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    const revenueByDay = days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const total = paidOrders
        .filter((o) => o.createdAt >= day && o.createdAt < next)
        .reduce((sum, o) => sum + o.total, 0);
      return { date: day.toISOString().slice(5, 10), total };
    });

    // best sellers
    const topProducts = await Product.find({ isActive: true })
      .sort({ soldCount: -1 })
      .limit(5)
      .select("name soldCount");

    res.json({
      totalRevenue,
      paidOrdersCount: paidOrders.length,
      pendingCount,
      activeProducts,
      revenueByDay,
      topProducts,
    });
  })
);

// GET /api/admin/report.xlsx — export orders as an Excel workbook
router.get(
  "/report.xlsx",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: 1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Detail Pesanan");

    sheet.columns = [
      { header: "ID Pesanan", key: "orderId", width: 16 },
      { header: "Tanggal", key: "createdAt", width: 18 },
      { header: "Pelanggan", key: "customerName", width: 16 },
      { header: "Telepon", key: "phone", width: 14 },
      { header: "Tipe", key: "orderType", width: 12 },
      { header: "Item", key: "items", width: 40 },
      { header: "Subtotal", key: "subtotal", width: 12 },
      { header: "PB1", key: "tax", width: 10 },
      { header: "Ongkir", key: "deliveryFee", width: 10 },
      { header: "Diskon", key: "discount", width: 10 },
      { header: "Total", key: "total", width: 12 },
      { header: "Pembayaran", key: "paymentStatus", width: 14 },
      { header: "Status Dapur", key: "kitchenStatus", width: 20 },
    ];
    sheet.getRow(1).font = { bold: true };

    orders.forEach((o) => {
      sheet.addRow({
        orderId: o.orderId,
        createdAt: o.createdAt.toISOString().slice(0, 16).replace("T", " "),
        customerName: o.customerName,
        phone: o.phone,
        orderType: o.orderType === "delivery" ? "Diantar" : "Ambil Sendiri",
        items: o.items.map((i) => `${i.name} x${i.qty}`).join(", "),
        subtotal: o.subtotal,
        tax: o.tax,
        deliveryFee: o.deliveryFee,
        discount: o.discount,
        total: o.total,
        paymentStatus: o.paymentStatus === "paid" ? "Lunas" : "Menunggu Bayar",
        kitchenStatus: o.kitchenStatus,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=laporan-penjualan-kopikita-${new Date()
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, "")}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  })
);

export default router;
