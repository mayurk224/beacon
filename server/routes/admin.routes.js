import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getAllUsers } from "../controllers/admin/admin.user.controller.js";
import { Router } from "express";
import { apiLimiter } from "../utils/rateLimiter.js";

const adminRouter = Router();

adminRouter.get("/users", protect, isAdmin, apiLimiter, getAllUsers)

export default adminRouter;