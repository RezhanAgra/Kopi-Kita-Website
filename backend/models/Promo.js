import mongoose from "mongoose";

const promoSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percent", "fixed"], required: true },
    value: { type: Number, required: true }, // percent (0-100) or fixed Rupiah amount
    maxDiscount: { type: Number, default: null }, // cap for percent-type
    minSubtotal: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Promo", promoSchema);
