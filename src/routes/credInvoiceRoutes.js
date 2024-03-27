import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";
import {
  addCredInvoiceController,
  creditorInvoicesController,
  updateCredInvoiceController,
} from "../controllers/credInvoiceController.js";

const credInvoiceRoutes = express.Router();

credInvoiceRoutes.post(
  "/add",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  addCredInvoiceController
);
credInvoiceRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateCredInvoiceController
);
credInvoiceRoutes.get(
  "/creditor/:id",
  [verifyToken],
  creditorInvoicesController
);

export default credInvoiceRoutes;
