import mongoose from "mongoose";
import userModel from "../models/user.model.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.userId; // from auth middleware

        const user = await userModel.findById(userId)
            .select("-password -refreshTokens -passwordResetToken -emailVerificationToken");

        // Try to populate organizations if the model is registered
        if (user && mongoose.models.Organization) {
            await user.populate({
                path: "memberships.organization",
                select: "name slug",
            });
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        return res.status(200).json({
            user,
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};