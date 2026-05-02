import userModel from "../../models/user.model.js";

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