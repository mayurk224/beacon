import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getProfile } from "../controllers/user.controller.js";

const userRoute = Router();

userRoute.get("/profile", protect, getProfile);

export default userRoute;