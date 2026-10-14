import express from "express";
import asyncHandler from "express-async-handler";
import Promo from "../models/Promo.js";
import { protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/promos/active — public list of active promo codes (for the homepage banner)
router.get(
  "/active",
  asyncHandler(async (req, res) => {
    const promos = await Promo.find({ isActive: true }).select("code description");
    res.json(promos);
  })
);

// POST /api/promos/validate  { code, subtotal }
router.post(
  "/validate",
  asyncHandler(async (req, res) => {
    const { code, subtotal } = req.body;
    if (!code) {
      res.status(400);
      throw new Error("Kode promo wajib diisi");
    }

    const promo = await Promo.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) {
      res.status(404);
      throw new Error("Kode promo tidak ditemukan atau tidak aktif");
    }
    if (promo.expiresAt && promo.expiresAt < new Date()) {
      res.status(400);
      throw new Error("Kode promo sudah kedaluwarsa");
    }
    if (subtotal < promo.minSubtotal) {
      res.status(400);
      throw new Error(
        `Minimal belanja Rp ${promo.minSubtotal.toLocaleString("id-ID")} untuk memakai kode ini`
      );
    }

    let discount = 0;
    if (promo.type === "percent") {
      discount = Math.round((subtotal * promo.value) / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else {
      discount = promo.value;
    }
    discount = Math.min(discount, subtotal);

    res.json({ code: promo.code, type: promo.type, value: promo.value, discount });
  })
);

// GET /api/promos (admin - list all)
router.get(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const promos = await Promo.find().sort({ createdAt: -1 });
    res.json(promos);
  })
);

// POST /api/promos (admin)
router.post(
  "/",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const promo = new Promo(req.body);
    const created = await promo.save();
    res.status(201).json(created);
  })
);

// PUT /api/promos/:id (admin)
router.put(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!promo) {
      res.status(404);
      throw new Error("Promo tidak ditemukan");
    }
    res.json(promo);
  })
);

// DELETE /api/promos/:id (admin)
router.delete(
  "/:id",
  protectAdmin,
  asyncHandler(async (req, res) => {
    const promo = await Promo.findByIdAndDelete(req.params.id);
    if (!promo) {
      res.status(404);
      throw new Error("Promo tidak ditemukan");
    }
    res.json({ message: "Promo dihapus" });
  })
);

export default router;
