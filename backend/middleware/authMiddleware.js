import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";

// Protect admin-only routes with a JWT issued at /api/admin/login
export const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = decoded;
      return next();
    } catch (err) {
      res.status(401);
      throw new Error("Sesi admin tidak valid, silakan login ulang");
    }
  }

  res.status(401);
  throw new Error("Tidak ada akses, token tidak ditemukan");
});
