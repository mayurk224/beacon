import { body } from "express-validator";
import mongoose from "mongoose";

export const createIncidentValidation = [
    body("title")
        .trim()
        .notEmpty().withMessage("Title is required")
        .isLength({ max: 100 }).withMessage("Title must be less than 100 characters"),
    body("description")
        .trim()
        .notEmpty().withMessage("Description is required"),
    body("severity")
        .isIn(["low", "medium", "high", "critical"]).withMessage("Invalid severity level"),
    body("organizationId")
        .notEmpty().withMessage("Organization ID is required")
        .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid organization ID"),
    body("assignedUsers")
        .optional()
        .isArray().withMessage("Assigned users must be an array")
        .custom((value) => {
            if (!Array.isArray(value)) return true;
            return value.every((id) => mongoose.Types.ObjectId.isValid(id));
        }).withMessage("One or more assigned user IDs are invalid"),
];
