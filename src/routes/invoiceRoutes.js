import express from "express";
import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import multer from "multer";

import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";
import {
  addBulkInvoicesForSalesBook,
  createInvoiceController,
  deleteInvoiceController,
  invoicesBySalesBooksController,
  updateInvoiceController,
} from "../controllers/invoiceController.js";

const invoiceRoutes = express.Router();
const upload = multer();

invoiceRoutes.post(
  "/add",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createInvoiceController
);
invoiceRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateInvoiceController
);
invoiceRoutes.delete(
  "/delete/:id",
  [verifyToken, authorize([ADMIN_ROLE])],
  deleteInvoiceController
);
invoiceRoutes.get("/book/:id", [verifyToken], invoicesBySalesBooksController);
invoiceRoutes.post(
  "/bulk-invoices/:id",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE]), upload.single("file")],
  addBulkInvoicesForSalesBook
);

export default invoiceRoutes;
