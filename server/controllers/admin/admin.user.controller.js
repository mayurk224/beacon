import userModel from "../../models/user.model.js";
import mongoose from "mongoose";

export const getAllUsers = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            search = "",
            isActive,
            role,
        } = req.query;

        // 🔹 Sanitize and validate pagination
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.min(100, Math.max(1, parseInt(limit) || 10));

        const query = {};

        // 🔹 Search (name or email)
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // 🔹 Filter by active status
        if (isActive !== undefined) {
            query.isActive = isActive === "true";
        }

        // 🔹 Filter by role (inside memberships)
        if (role) {
            query["memberships.role"] = role;
        }

        const skip = (page - 1) * limit;

        // 🔹 Fetch users
        const users = await userModel.find(query)
            .select("-password -refreshTokens -passwordResetToken -emailVerificationToken -twoFactorSecret")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await userModel.countDocuments(query);

        return res.status(200).json({
            users,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            },
        });

    } catch (error) {
        console.error("Admin Get Users Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // 🔹 Validate user ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await userModel.findById(id)
            .select(
                "-password -refreshTokens -passwordResetToken -emailVerificationToken -twoFactorSecret"
            )
            .populate({
                path: "memberships.organization",
                select: "name slug",
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            user,
        });

    } catch (error) {
        console.error("Admin Get User Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const adminId = req.userId;

        // 🔹 Validate ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // 🔹 Validate input
        if (typeof isActive !== "boolean") {
            return res.status(400).json({ message: "isActive must be boolean" });
        }

        // 🔹 Prevent self-deactivation
        if (adminId === id && isActive === false) {
            return res.status(400).json({
                message: "You cannot deactivate your own account",
            });
        }

        const user = await userModel.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔹 Update status
        user.isActive = isActive;

        // 🔥 If deactivated → logout from all devices
        if (!isActive) {
            user.refreshTokens = [];
        }

        await user.save();

        return res.status(200).json({
            message: `User ${isActive ? "activated" : "deactivated"} successfully`,
            user: {
                _id: user._id,
                email: user.email,
                isActive: user.isActive,
            },
        });

    } catch (error) {
        console.error("Update Status Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};