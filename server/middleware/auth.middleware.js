import jwt from "jsonwebtoken";
import config from "../config/config.js";

export const protect = (req, res, next) => {
    try {
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