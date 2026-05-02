import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { changePassword, deleteAvatar, getActiveSessions, getProfile, logoutAllSessions, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { changePasswordValidation, updateProfileValidation } from "../config/validation/user.validation.js";
import { upload } from "../middleware/upload.middleware.js";
import { logoutAllLimiter, passwordChangeLimiter } from "../utils/rateLimiter.js";
import { createOrganization, addUserToOrganization } from "../controllers/user.organization.controller.js";
import { createOrganizationValidation, addUserToOrganizationValidation } from "../config/validation/organization.validation.js";

const userRoute = Router();

userRoute.get("/profile", protect, getProfile);
userRoute.patch("/profile", protect, updateProfileValidation, updateProfile);
userRoute.post("/profile/avatar", protect, upload.single("avatar"), updateAvatar);
userRoute.delete("/profile/avatar", protect, deleteAvatar);
userRoute.post("/profile/password", protect, passwordChangeLimiter, changePasswordValidation, changePassword);
userRoute.get("/profile/sessions", protect, getActiveSessions);
userRoute.post("/profile/logout", protect, logoutAllLimiter, logoutAllSessions);

userRoute.post("/organization", protect, createOrganizationValidation, createOrganization);
userRoute.post("/organization/user", protect, addUserToOrganizationValidation, addUserToOrganization);

export default userRoute;