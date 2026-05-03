import mongoose from "mongoose";
import { validationResult } from "express-validator";
import userModel from "../../models/user.model.js";
import incidentModel from "../../models/incident.model.js";

export const createIncident = async (req, res) => {
    try {
        // 🔹 1. Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const userId = req.userId;
        const { title, description, severity, organizationId, assignedUsers = [] } = req.body;

        // 🔹 2. Check user belongs to organization and has permission
        const user = await userModel.findOne({
            _id: userId,
            "memberships.organization": organizationId,
        });

        if (!user) {
            return res.status(403).json({ message: "You are not part of this organization" });
        }

        // 🔹 3. Validate assigned users (if any)
        if (assignedUsers.length > 0) {
            const validUsers = await userModel.find({
                _id: { $in: assignedUsers },
                "memberships.organization": organizationId
            });

            if (validUsers.length !== assignedUsers.length) {
                return res.status(400).json({ message: "One or more assigned users are invalid or not in the organization" });
            }
        }

        // 🔹 4. Create incident
        const incident = await incidentModel.create({
            title,
            description,
            severity,
            organization: organizationId,
            createdBy: userId,
            assignedUsers,
        });

        return res.status(201).json({
            message: "Incident created successfully",
            incident,
        });

    } catch (error) {
        console.error("Create Incident Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};