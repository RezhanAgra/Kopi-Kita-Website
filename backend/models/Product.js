import mongoose from "mongoose";

const sizeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Reguler (12 oz)"
    extraPrice: { type: Number, default: 0 },
  },
  { _id: false }
);

const toppingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["kopi-spesial", "non-kopi", "boba"],
    },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    basePrice: { type: Number, required: true },
    sizes: { type: [sizeSchema], default: [] },
    iceLevels: {
      type: [String],
      default: ["Es Normal", "Es Sedikit", "Tanpa Es"],
    },
    sweetnessLevels: {
      type: [String],
      default: ["Manis 100%", "Manis 70%", "Manis 50%", "Tanpa Gula"],
    },
    toppings: { type: [toppingSchema], default: [] },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
