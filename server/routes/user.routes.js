import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";
import { updateProfileValidation } from "../config/validation/user.validation.js";

const userRoute = Router();

userRoute.get("/profile", protect, getProfile);
userRoute.patch("/profile", protect, updateProfileValidation, updateProfile);

export default userRoute;