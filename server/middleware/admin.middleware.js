import userModel from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel.findById(userId);

    if (!user || user.role !== "admin" || !user.isActive) {
      return res.status(403).json({ message: "Forbidden: Admin access required or account deactivated" });
    }

    req.user = user; // Populate req.user for subsequent middlewares/controllers
    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};