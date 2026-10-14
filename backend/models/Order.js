import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    size: { type: String },
    ice: { type: String },
    sweetness: { type: String },
    toppings: { type: [String], default: [] },
    qty: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

const KITCHEN_STATUSES = [
  "menunggu_konfirmasi",
  "sedang_diracik",
  "siap_diambil_dikirim",
  "selesai",
];

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true }, // KPK-XXXXXXXX
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    orderType: { type: String, enum: ["pickup", "delivery"], default: "pickup" },
    notes: { type: String, default: "" },

    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 }, // PB1 10%
    deliveryFee: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    promoCode: { type: String, default: null },
    total: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "midtrans" },
    midtransOrderId: { type: String },
    midtransTransactionId: { type: String },

    kitchenStatus: {
      type: String,
      enum: KITCHEN_STATUSES,
      default: "menunggu_konfirmasi",
    },
  },
  { timestamps: true }
);

export const KITCHEN_STATUS_LIST = KITCHEN_STATUSES;
export default mongoose.model("Order", orderSchema);
