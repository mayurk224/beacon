import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getProfile, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { updateProfileValidation } from "../config/validation/user.validation.js";
import { upload } from "../middleware/upload.middleware.js";

const userRoute = Router();

userRoute.get("/profile", protect, getProfile);
userRoute.patch("/profile", protect, updateProfileValidation, updateProfile);
userRoute.post("/avatar", protect, upload.single("avatar"), updateAvatar);

export default userRoute;