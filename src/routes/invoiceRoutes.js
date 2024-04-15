import express from "express";
import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import multer from "multer";

import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";
import {
  addBulkInvoicesForSalesBook,
  createInvoiceCreditorController,
  createInvoiceRangeController,
  createInvoiceSingleController,
  deleteCreditorPaymentController,
  deleteInvoiceController,
  getCreditorPaymentsInvoices,
  getTotalPaymentsFilteredByDateController,
  invoicesBySalesBooksController,
  updateInvoiceController,
  updateInvoiceCreditorController,
} from "../controllers/invoiceController.js";

const invoiceRoutes = express.Router();
const upload = multer();

invoiceRoutes.post(
  "/add-range",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createInvoiceRangeController
);
invoiceRoutes.post(
  "/add-single",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createInvoiceSingleController
);
invoiceRoutes.post(
  "/add-cred",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createInvoiceCreditorController
);
invoiceRoutes.put(
  "/update/:type",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateInvoiceController
);
invoiceRoutes.put(
  "/update-cred",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateInvoiceCreditorController
);
invoiceRoutes.delete(
  "/delete/:id/:type",
  [verifyToken, authorize([ADMIN_ROLE])],
  deleteInvoiceController
);
invoiceRoutes.delete(
  "/delete-cred/:id",
  [verifyToken, authorize([ADMIN_ROLE])],
  deleteCreditorPaymentController
);
invoiceRoutes.get(
  "/book/:id/:type",
  [verifyToken],
  invoicesBySalesBooksController
);
invoiceRoutes.get(
  "/cred-payments/:id",
  [verifyToken],
  getCreditorPaymentsInvoices
);
invoiceRoutes.post(
  "/bulk-invoices/:id",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE]), upload.single("file")],
  addBulkInvoicesForSalesBook
);
invoiceRoutes.post(
  "/payment-total",
  [verifyToken],
  getTotalPaymentsFilteredByDateController
);

export default invoiceRoutes;
