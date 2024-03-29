import express from "express";
import { verifyToken } from "../auth/auth.js";
import { authorize } from "../auth/authorize.js";
import {
  createCreditorController,
  getAllCreditorsController,
  getCreditorDetailsController,
  updateCreditorController,
} from "../controllers/creditorController.js";
import { ADMIN_ROLE, MANAGER_ROLE } from "../constants/employeeRoles.js";

const creditorRoutes = express.Router();

creditorRoutes.get("/all", [verifyToken], getAllCreditorsController);
creditorRoutes.post(
  "/create",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  createCreditorController
);
creditorRoutes.put(
  "/update",
  [verifyToken, authorize([ADMIN_ROLE, MANAGER_ROLE])],
  updateCreditorController
);
creditorRoutes.get("/details/:id", [verifyToken], getCreditorDetailsController);

export default creditorRoutes;
