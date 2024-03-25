import express from "express";
import authRoutes from "./authRoutes.js";
import empRoutes from "./employeeRoutes.js";
import salesBookRoutes from "./salesBookRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/emp", empRoutes);
router.use("/sales-book", salesBookRoutes);

export default router;
