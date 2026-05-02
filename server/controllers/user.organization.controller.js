import organizationModel from "../models/organization.model.js";
import userModel from "../models/user.model.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { validationResult } from "express-validator";

export const createOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const userId = req.userId;
        const { name } = req.body;

        // 2. Generate slug
        const baseSlug = slugify(name, { lower: true, strict: true });
        let slug = baseSlug;

        // 3. Ensure unique slug
        let existing = await organizationModel.findOne({ slug }).session(session);
        let counter = 1;

        while (existing) {
            slug = `${baseSlug}-${counter++}`;
            existing = await organizationModel.findOne({ slug }).session(session);
        }

        // 4. Create org
        const organization = await organizationModel.create([{
            name,
            slug,
            owner: userId,
        }], { session });

        const orgId = organization[0]._id;

        // 5. Add membership to user
        await userModel.findByIdAndUpdate(userId, {
            $push: {
                memberships: {
                    organization: orgId,
                    role: "admin",
                },
            },
        }, { session });

        await session.commitTransaction();
        session.endSession();

        // 6. Audit Log
        console.info(`[AUDIT] Organization created: ${name} (ID: ${orgId}) by User: ${userId}`);

        return res.status(201).json({
            message: "Organization created successfully",
            organization: organization[0],
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Create Org Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const addUserToOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const requesterId = req.userId;
        const { email, role = "responder", organizationId } = req.body;

        // 2. Verify organization exists
        const organization = await organizationModel.findById(organizationId).session(session);
        if (!organization) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Organization not found" });
        }

        // 3. Verify requester is admin of the organization
        const requester = await userModel.findOne({
            _id: requesterId,
            "memberships.organization": organizationId,
            "memberships.role": "admin"
        }).session(session);

        if (!requester) {
            await session.abortTransaction();
            return res.status(403).json({ message: "Only organization admins can add users" });
        }

        // 4. Find user to add
        const userToAdd = await userModel.findOne({ email }).session(session);
        if (!userToAdd) {
            await session.abortTransaction();
            return res.status(404).json({ message: "User not found with this email" });
        }

        // 5. Check if user is already a member
        const isAlreadyMember = userToAdd.memberships.some(
            m => m.organization.toString() === organizationId
        );

        if (isAlreadyMember) {
            await session.abortTransaction();
            return res.status(409).json({ message: "User is already a member of this organization" });
        }

        // 6. Add membership
        await userModel.findByIdAndUpdate(userToAdd._id, {
            $push: {
                memberships: {
                    organization: organizationId,
                    role,
                },
            },
        }, { session });

        // 7. Increment members count
        await organizationModel.findByIdAndUpdate(organizationId, {
            $inc: { membersCount: 1 }
        }, { session });

        await session.commitTransaction();
        session.endSession();

        // 8. Audit Log
        console.info(`[AUDIT] User ${userToAdd._id} added to Organization ${organizationId} with role ${role} by Admin ${requesterId}`);

        return res.status(200).json({
            message: "User added to organization successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Add User to Org Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};