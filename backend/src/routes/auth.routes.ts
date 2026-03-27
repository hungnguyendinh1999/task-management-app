import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// POST /api/auth/register - Register a new user
router.post("/register", authController.registerUser);

// POST /api/auth/login - Login and get JWT token
router.post("/login", authController.loginUser);

export default router;
