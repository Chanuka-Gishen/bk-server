import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";
import {
  PaymentAddController,
  PaymentDeleteController,
  PaymentUpdateController,
  PaymentsGetController,
} from "../controllers/paymentController.js";

const paymentRoutes = express.Router();

paymentRoutes.post(
  "/add",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  PaymentAddController
);
paymentRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  PaymentUpdateController
);
paymentRoutes.delete(
  "/delete/:id",
  [verifyToken, authorize([ADMIN_ROLE])],
  PaymentDeleteController
);
paymentRoutes.get("/invoices", [verifyToken], PaymentsGetController);

export default paymentRoutes;
