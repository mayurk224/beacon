import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { getAllUsers, getUserById, updateUserRole, updateUserStatus } from "../controllers/admin/admin.user.controller.js";
import { updateUserRoleValidation, updateUserStatusValidation } from "../config/validation/user.validation.js";
import { Router } from "express";
import { apiLimiter } from "../utils/rateLimiter.js";

const adminRouter = Router();

adminRouter.get("/users", protect, isAdmin, apiLimiter, getAllUsers)
adminRouter.get("/users/:id", protect, isAdmin, apiLimiter, getUserById)
adminRouter.patch("/users/:id", protect, isAdmin, apiLimiter, updateUserStatusValidation, updateUserStatus)
adminRouter.patch("/users/:id/role", protect, isAdmin, apiLimiter, updateUserRoleValidation, updateUserRole)

export default adminRouter;