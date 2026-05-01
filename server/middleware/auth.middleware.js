import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const protect = (req, res, next) => {
    try {
        // Ensure cookie-parser is installed and configured
        if (!req.cookies) {
            console.error("Cookie-parser middleware not configured");
            return res.status(500).json({ message: "Internal server error" });
        }

        const token = req.cookies.accessToken;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET);

        req.userId = decoded.userId;

        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};