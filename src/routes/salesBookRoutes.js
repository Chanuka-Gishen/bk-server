import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import {
  createSalesBookController,
  downloadInvoicesReportController,
  getSalesBooksController,
  getTotalCashBalanceController,
  updateSalesBookController,
} from "../controllers/salesBookController.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";

const salesBookRoutes = express.Router();

salesBookRoutes.get("/", [verifyToken], getSalesBooksController);
salesBookRoutes.post(
  "/create",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createSalesBookController
);
salesBookRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateSalesBookController
);
salesBookRoutes.get(
  "/cash-balance",
  [verifyToken],
  getTotalCashBalanceController
);
salesBookRoutes.get("/download-summary", downloadInvoicesReportController);

export default salesBookRoutes;
