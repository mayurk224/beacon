import mongoose from "mongoose";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import Organization from "../models/organization.model.js";

export const getProfile = async (req, res) => {
    try {
        const userId = req.userId; // from auth middleware

        const user = await userModel.findById(userId)
            .select("-password -refreshTokens -passwordResetToken -emailVerificationToken")
            .populate({
                path: "memberships.organization",
                select: "name slug",
            });

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

export const updateProfile = async (req, res) => {
    try {
        // 1. Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const userId = req.userId;
        const { name, avatar, preferences } = req.body;

        const updateData = {};

        // 2. Build update object
        if (name) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;

        if (preferences) {
            if (preferences.theme) {
                updateData["preferences.theme"] = preferences.theme;
            }

            if (preferences.notifications) {
                const { email, sms, slack } = preferences.notifications;

                if (email !== undefined) {
                    updateData["preferences.notifications.email"] = email;
                }

                if (sms !== undefined) {
                    updateData["preferences.notifications.sms"] = sms;
                }

                if (slack !== undefined) {
                    updateData["preferences.notifications.slack"] = slack;
                }
            }
        }

        // 3. Prevent empty update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        // 4. Update user (Atomic operation)
        // We use returnDocument: 'after' instead of new: true (deprecated)
        const user = await userModel.findOneAndUpdate(
            { _id: userId, isActive: true },
            { $set: updateData },
            { returnDocument: "after", runValidators: true }
        ).select("-password -refreshTokens -passwordResetToken -emailVerificationToken");

        if (!user) {
            // Check if user exists but is inactive, or doesn't exist at all
            const existingUser = await userModel.findById(userId);
            if (!existingUser) {
                return res.status(404).json({ message: "User not found" });
            }
            if (!existingUser.isActive) {
                return res.status(403).json({ message: "Account is deactivated" });
            }
            // Fallback (should not happen given the logic above)
            return res.status(400).json({ message: "Update failed" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            user,
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};