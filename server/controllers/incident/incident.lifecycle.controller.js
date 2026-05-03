import mongoose from "mongoose";
import { validationResult } from "express-validator";
import userModel from "../../models/user.model.js";
import incidentModel from "../../models/incident.model.js";
import incidentUpdateModel from "../../models/incidentUpdate.model.js";

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

export const getAllIncidents = async (req, res) => {
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

        const {
            page = 1,
            limit = 10,
            status,
            severity,
            organizationId,
            sortBy = "createdAt",
            sortOrder = "desc"
        } = req.query;

        // 🔹 2. Get user's organizations
        const user = await userModel.findById(userId).select("memberships.organization");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const orgIds = user.memberships.map((m) => m.organization.toString());

        // 🔹 3. Build query
        const query = {
            organization: { $in: orgIds },
        };

        if (status) query.status = status;
        if (severity) query.severity = severity;

        // If organizationId is provided, check if user belongs to it
        if (organizationId) {
            if (!orgIds.includes(organizationId)) {
                return res.status(403).json({ message: "You do not have access to this organization" });
            }
            query.organization = organizationId;
        }

        const skip = (Number(page) - 1) * Number(limit);

        // 🔹 4. Fetch incidents with dynamic sorting
        const sort = {};
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        const incidents = await incidentModel.find(query)
            .populate("createdBy", "name email")
            .populate("assignedUsers", "name email")
            .sort(sort)
            .skip(skip)
            .limit(Number(limit));

        const total = await incidentModel.countDocuments(query);

        return res.status(200).json({
            incidents,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit)),
            },
        });

    } catch (error) {
        console.error("Get Incidents Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getIncidentById = async (req, res) => {
    try {
        // 🔹 1. Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { id } = req.params;
        const userId = req.userId;

        // 🔹 2. Get incident
        const incident = await incidentModel.findById(id)
            .populate("createdBy", "name email avatar")
            .populate("assignedUsers", "name email avatar");

        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        // 🔹 3. Check user belongs to same org
        const user = await userModel.findOne({
            _id: userId,
            "memberships.organization": incident.organization,
        });

        if (!user) {
            return res.status(403).json({ message: "Access denied" });
        }

        return res.status(200).json({
            incident,
        });

    } catch (error) {
        console.error("Get Incident Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addIncidentUpdate = async (req, res) => {
    try {
        // 🔹 1. Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { id } = req.params; // incidentId
        const userId = req.userId;
        const { message, status } = req.body;

        // 🔹 2. Get incident
        const incident = await incidentModel.findById(id);
        if (!incident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        // 🔹 3. Check org membership
        const user = await userModel.findOne({
            _id: userId,
            "memberships.organization": incident.organization,
        });

        if (!user) {
            return res.status(403).json({ message: "Access denied" });
        }

        // 🔹 4. Create update
        const update = await incidentUpdateModel.create({
            incident: id,
            message,
            status,
            createdBy: userId,
        });

        // 🔹 5. Update incident status automatically
        if (status) {
            incident.status = status;

            if (status === "resolved") {
                incident.resolvedAt = new Date();
            } else {
                // If status changed back from resolved, clear resolvedAt
                incident.resolvedAt = undefined;
            }

            await incident.save();
        }

        return res.status(201).json({
            message: "Update added successfully",
            update,
        });

    } catch (error) {
        console.error("Add Update Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};