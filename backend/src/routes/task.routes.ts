import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import * as taskController from "../controllers/task.controller.js";

const router = Router();

// Apply authentication middleware to all task routes
router.use(authMiddleware);

router.get("/", taskController.listTasks);

router.post("/", taskController.createTask);

router.put("/:id", taskController.updateTask);

router.delete("/:id", taskController.deleteTask);

export default router;
