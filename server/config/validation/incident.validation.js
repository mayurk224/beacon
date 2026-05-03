import { body, query, param } from "express-validator";
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

export const getAllIncidentsValidation = [
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
    query("status")
        .optional()
        .isIn(["open", "investigating", "resolved"]).withMessage("Invalid status"),
    query("severity")
        .optional()
        .isIn(["low", "medium", "high", "critical"]).withMessage("Invalid severity"),
    query("organizationId")
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid organization ID"),
    query("sortBy")
        .optional()
        .isString().withMessage("Sort field must be a string"),
    query("sortOrder")
        .optional()
        .isIn(["asc", "desc"]).withMessage("Sort order must be 'asc' or 'desc'"),
];

export const getIncidentByIdValidation = [
    param("id")
        .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid incident ID"),
];

export const addIncidentUpdateValidation = [
    param("id")
        .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid incident ID"),
    body("message")
        .trim()
        .notEmpty().withMessage("Update message is required")
        .isLength({ max: 2000 }).withMessage("Message must be less than 2000 characters"),
    body("status")
        .optional()
        .isIn(["open", "investigating", "resolved"]).withMessage("Invalid status level"),
];

export const getIncidentUpdatesValidation = [
    param("id")
        .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage("Invalid incident ID"),
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("Limit must be between 1 and 100"),
];
