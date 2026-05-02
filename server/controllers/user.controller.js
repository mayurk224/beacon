import crypto from "crypto";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import Organization from "../models/organization.model.js";
import { imagekit } from "../config/imagekit.js";

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

        const update = { $set: {} };

        // 2. Build update object
        if (name) update.$set.name = name;
        if (avatar !== undefined) update.$set.avatar = avatar;

        if (preferences) {
            if (preferences.theme) {
                update.$set["preferences.theme"] = preferences.theme;
            }

            if (preferences.notifications) {
                const { email, sms, slack } = preferences.notifications;

                if (email !== undefined) {
                    update.$set["preferences.notifications.email"] = email;
                }

                if (sms !== undefined) {
                    update.$set["preferences.notifications.sms"] = sms;
                }

                if (slack !== undefined) {
                    update.$set["preferences.notifications.slack"] = slack;
                }
            }
        }

        // 3. Prevent empty update
        if (Object.keys(update.$set).length === 0) {
            return res.status(400).json({ message: "No valid fields to update" });
        }

        // 4. Update user (Atomic operation)
        // We use returnDocument: 'after' instead of new: true (deprecated)
        const user = await userModel.findOneAndUpdate(
            { _id: userId, isActive: true },
            update,
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

export const updateAvatar = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Check if file exists
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 2. Check if user exists and is active
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.isActive) {
            return res.status(403).json({ message: "Account is deactivated" });
        }

        // 3. Upload to ImageKit
        // ImageKit handles optimization and storage
        const uploaded = await imagekit.upload({
            file: req.file.buffer,
            fileName: `avatar-${userId}-${Date.now()}.jpg`, // Added timestamp for uniqueness and cache busting
            folder: "/avatars",
            useUniqueFileName: true,
            transformation: {
                pre: "w-300,h-300,fo-face,c-at_max,q-80", // Resize, focus face, max quality 80% for compression
            },
        });

        if (!uploaded || !uploaded.url) {
            throw new Error("Image upload failed");
        }

        // 4. Optional: Cleanup old avatar from ImageKit
        if (user.avatarFileId) {
            try {
                await imagekit.deleteFile(user.avatarFileId);
            } catch (cleanupError) {
                console.error("Avatar cleanup failed:", cleanupError.message, { userId, fileId: user.avatarFileId });
                // Don't fail the update if cleanup fails
            }
        }

        // 5. Update user profile
        const updatedUser = await userModel.findByIdAndUpdate(
            userId,
            {
                avatar: uploaded.url,
                avatarFileId: uploaded.fileId
            },
            { returnDocument: "after", runValidators: true }
        ).select("-password -refreshTokens -passwordResetToken -emailVerificationToken");

        return res.status(200).json({
            message: "Avatar updated successfully",
            avatar: uploaded.url,
            user: updatedUser,
        });

    } catch (error) {
        console.error("Update Avatar Error:", error);

        // Handle ImageKit specific errors if any
        if (error.message && error.message.includes("ImageKit")) {
            return res.status(502).json({ message: "Image storage service error" });
        }

        return res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteAvatar = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔹 If avatar exists, delete from ImageKit
        if (user.avatarFileId) {
            try {
                await imagekit.deleteFile(user.avatarFileId);
            } catch (error) {
                console.warn("Avatar deletion failed:", error.message);
            }
        }

        // 🔹 Remove from DB
        user.avatar = "";
        user.avatarFileId = undefined;

        await user.save();

        // 🔹 Exclude sensitive fields manually or refetch with select
        const userResponse = await userModel.findById(userId)
            .select("-password -refreshTokens -passwordResetToken -emailVerificationToken");

        return res.status(200).json({
            message: "Avatar removed successfully",
            user: userResponse,
        });

    } catch (error) {
        console.error("Delete Avatar Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const changePassword = async (req, res) => {
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
        const { currentPassword, newPassword } = req.body;

        // 2. Get user
        const user = await userModel.findById(userId);

        if (!user || !user.password) {
            console.warn(`[Audit] Password change attempt for non-existent user or OAuth user: ${userId}`);
            return res.status(400).json({ message: "User not found or invalid auth provider" });
        }

        // 3. Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            console.warn(`[Audit] Failed password change attempt (incorrect current password) for user: ${userId}`);
            return res.status(401).json({ message: "Current password is incorrect" });
        }

        // 4. Prevent same password reuse
        const isSame = await bcrypt.compare(newPassword, user.password);
        if (isSame) {
            return res.status(400).json({ message: "New password must be different from current password" });
        }

        // 5. Hash new password with strong salt
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(newPassword, salt);

        // 6. Invalidate all sessions (OWASP Guideline)
        user.refreshTokens = [];

        await user.save();

        // 7. Clear cookies (force re-login)
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");

        console.info(`[Audit] Password successfully changed for user: ${userId}`);

        return res.status(200).json({
            message: "Password changed successfully. Please login again.",
        });

    } catch (error) {
        console.error("Change Password Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getActiveSessions = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId).select("refreshTokens");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const sessions = user.refreshTokens.map((session) => ({
            id: session._id || crypto.randomUUID(),
            createdAt: session.createdAt,
            userAgent: session.userAgent,
            ip: session.ip,
        }));

        return res.status(200).json({
            sessions,
        });

    } catch (error) {
        console.error("Get Sessions Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const logoutAllSessions = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔹 1. Invalidate all sessions in database
        user.refreshTokens = [];
        await user.save();

        // 🔹 2. Clear cookies for the current client
        res.clearCookie("accessToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });
        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
        });

        // 🔹 3. Security Audit Log
        console.log(`[SECURITY AUDIT] User ${userId} logged out from all devices at ${new Date().toISOString()} from IP: ${req.ip}`);

        return res.status(200).json({
            message: "Logged out from all devices successfully",
        });

    } catch (error) {
        console.error("Logout All Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};