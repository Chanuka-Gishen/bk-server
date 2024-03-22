import express from "express";
import {
  loginController,
  logoutController,
} from "../controllers/authController.js";
import { verifyToken } from "../auth/auth.js";

const authRoutes = express.Router();

authRoutes.post("/login", loginController);
authRoutes.get("/logout", [verifyToken], logoutController);

export default authRoutes;
