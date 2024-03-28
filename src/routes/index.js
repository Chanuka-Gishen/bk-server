import express from "express";
import authRoutes from "./authRoutes.js";
import empRoutes from "./employeeRoutes.js";
import salesBookRoutes from "./salesBookRoutes.js";
import creditorRoutes from "./creditorRoutes.js";
import credInvoiceRoutes from "./credInvoiceRoutes.js";
import invoiceRoutes from "./invoiceRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/emp", empRoutes);
router.use("/sales-book", salesBookRoutes);
router.use("/creditor", creditorRoutes);
router.use("/credInvoice", credInvoiceRoutes);
router.use("/invoice", invoiceRoutes);

export default router;
