import express from "express";

import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import {
  getEmployeesController,
  registerEmployeeController,
  resetEmpPassword,
  updateEmpController,
} from "../controllers/employeeController.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";

const empRoutes = express.Router();

empRoutes.post(
  "/register",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  registerEmployeeController
);
empRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateEmpController
);
empRoutes.get(
  "/resetPwd/:id",
  [verifyToken, authorize([ADMIN_ROLE])],
  resetEmpPassword
);
empRoutes.get("/list", [verifyToken], getEmployeesController);

export default empRoutes;
