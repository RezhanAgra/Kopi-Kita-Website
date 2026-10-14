import express from "express";
import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/products  (public - only active products, grouped for menu page)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const filter = req.query.all === "true" ? {} : { isActive: true };
    const products = await Product.find(filter).sort({ category: 1, createdAt: 1 });
    res.json(products);
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Produk tidak ditemukan");
    }
    res.json(product);
  })
);

// POST /api/products (admin)
router.post(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const product = new Product(req.body);
    const created = await product.save();
    res.status(201).json(created);
  })
);

// PUT /api/products/:id (admin)
router.put(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      res.status(404);
      throw new Error("Produk tidak ditemukan");
    }
    res.json(product);
  })
);

// DELETE /api/products/:id (admin)
router.delete(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404);
      throw new Error("Produk tidak ditemukan");
    }
    res.json({ message: "Produk dihapus" });
  })
);

export default router;
