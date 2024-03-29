import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";
import {
  addCredInvoiceController,
  creditorInvoiceDeleteController,
  creditorInvoicesController,
  filterCreInvoicessByDaysController,
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
credInvoiceRoutes.delete(
  "/delete/:id",
  [verifyToken, authorize([ADMIN_ROLE])],
  creditorInvoiceDeleteController
);
credInvoiceRoutes.get(
  "/creditor/:id",
  [verifyToken],
  creditorInvoicesController
);
credInvoiceRoutes.post(
  "/filterByDays",
  [verifyToken],
  filterCreInvoicessByDaysController
);

export default credInvoiceRoutes;
