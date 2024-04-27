import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import {
  GetOpeningBalance,
  addCashBalanceController,
  getTodayOpeningCashBalanceController,
  resetOpeningCashBalanceController,
  updateOpeningBalanceController,
} from "../controllers/cashBalanceController.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";

const cashBalanceRoutes = express.Router();

cashBalanceRoutes.post(
  "/add",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  addCashBalanceController
);
cashBalanceRoutes.get("/recent", [verifyToken], GetOpeningBalance);
cashBalanceRoutes.get(
  "/today",
  [verifyToken],
  getTodayOpeningCashBalanceController
);
cashBalanceRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateOpeningBalanceController
);
cashBalanceRoutes.get(
  "/reset/:id",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  resetOpeningCashBalanceController
);

export default cashBalanceRoutes;
