import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as userController from "../controllers/user.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/", userController.listUsers);

export default router;
