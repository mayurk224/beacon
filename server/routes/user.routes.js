import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { changePassword, deleteAvatar, getActiveSessions, getProfile, logoutAllSessions, updateAvatar, updateProfile } from "../controllers/user.controller.js";
import { changePasswordValidation, updateProfileValidation } from "../config/validation/user.validation.js";
import { upload } from "../middleware/upload.middleware.js";
import { logoutAllLimiter, passwordChangeLimiter, apiLimiter } from "../utils/rateLimiter.js";
import { createOrganization, acceptInvite, sendInvite, getMyOrganizations, getOrganizationById, updateMemberRole, removeMember } from "../controllers/user.organization.controller.js";
import { createOrganizationValidation, sendInviteValidation, acceptInviteValidation, getOrganizationByIdValidation, updateMemberRoleValidation, removeMemberValidation } from "../config/validation/organization.validation.js";

const userRoute = Router();

userRoute.get("/profile", protect, getProfile);
userRoute.patch("/profile", protect, updateProfileValidation, updateProfile);
userRoute.post("/profile/avatar", protect, upload.single("avatar"), updateAvatar);
userRoute.delete("/profile/avatar", protect, deleteAvatar);
userRoute.post("/profile/password", protect, passwordChangeLimiter, changePasswordValidation, changePassword);
userRoute.get("/profile/sessions", protect, getActiveSessions);
userRoute.post("/profile/logout", protect, logoutAllLimiter, logoutAllSessions);

userRoute.post("/organization", protect, createOrganizationValidation, createOrganization);
userRoute.post("/organization/user/invite", protect, sendInviteValidation, sendInvite);
userRoute.post("/organization/user/invite/accept", protect, acceptInviteValidation, acceptInvite);
userRoute.get("/organization", protect, apiLimiter, getMyOrganizations);
userRoute.get("/organization/:id", protect, apiLimiter, getOrganizationByIdValidation, getOrganizationById);
userRoute.post("/organization/:orgId/members/:userId/role", protect, updateMemberRoleValidation, updateMemberRole);
userRoute.delete("/organization/:orgId/members/:userId/remove", protect, removeMemberValidation, removeMember);

export default userRoute;