import organizationModel from "../models/organization.model.js";
import userModel from "../models/user.model.js";
import inviteModel from "../models/invite.model.js";
import slugify from "slugify";
import mongoose from "mongoose";
import { validationResult } from "express-validator";
import config from "../config/config.js";
import crypto from "crypto";
import { sendInviteEmail } from "../services/mail.service.js";

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

export const sendInvite = async (req, res) => {
    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { email, role = "responder", organizationId } = req.body;
        const adminId = req.userId;

        // 2. Verify organization exists
        const organization = await organizationModel.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // 3. Verify requester is admin of the organization
        const requester = await userModel.findOne({
            _id: adminId,
            "memberships.organization": organizationId,
            "memberships.role": "admin"
        });

        if (!requester) {
            return res.status(403).json({ message: "Only organization admins can send invites" });
        }

        // 4. Check if user is already a member
        const userToInvite = await userModel.findOne({ email });
        if (userToInvite) {
            const isAlreadyMember = userToInvite.memberships.some(
                m => m.organization.toString() === organizationId
            );
            if (isAlreadyMember) {
                return res.status(409).json({ message: "User is already a member of this organization" });
            }
        } else {
            return res.status(404).json({ message: "User not found with this email" });
        }

        // 5. Check if a pending invite already exists for this email and organization
        const existingInvite = await inviteModel.findOne({
            email,
            organization: organizationId,
            status: "pending",
            expiresAt: { $gt: Date.now() }
        });

        if (existingInvite) {
            return res.status(409).json({ message: "A pending invitation already exists for this email" });
        }

        // 6. Create invite
        const token = crypto.randomBytes(32).toString("hex");
        await inviteModel.create({
            email,
            role,
            organization: organizationId,
            token,
            expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
            invitedBy: adminId,
        });

        const inviteLink = `${config.CLIENT_URL}/accept-invite?token=${token}`;

        // 7. Send email
        await sendInviteEmail({
            email,
            organizationName: organization.name,
            inviteLink,
            role
        });

        return res.status(200).json({
            message: "Invite sent successfully",
        });

    } catch (error) {
        console.error("Send Invite Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptInvite = async (req, res) => {
    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { token } = req.body;
        const userId = req.userId;

        // 2. Find and validate invite
        const invite = await inviteModel.findOne({
            token,
            status: "pending",
            expiresAt: { $gt: Date.now() },
        });

        if (!invite) {
            return res.status(400).json({ message: "Invalid or expired invite" });
        }

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 3. Email match check
        if (user.email !== invite.email) {
            return res.status(403).json({ message: "This invite is not for your email" });
        }

        // 4. Check if already a member (defensive)
        const isAlreadyMember = user.memberships.some(
            m => m.organization.toString() === invite.organization.toString()
        );

        if (isAlreadyMember) {
            invite.status = "accepted";
            await invite.save();
            return res.status(200).json({ message: "You are already a member of this organization" });
        }

        // 5. Add membership and increment count
        user.memberships.push({
            organization: invite.organization,
            role: invite.role,
            joinedAt: new Date(),
        });

        await user.save();

        await organizationModel.findByIdAndUpdate(invite.organization, {
            $inc: { membersCount: 1 }
        });

        // 6. Mark invite used
        invite.status = "accepted";
        await invite.save();

        // 7. Audit Log
        console.info(`[AUDIT] User ${userId} accepted invite for Organization ${invite.organization} with role ${invite.role}`);

        return res.status(200).json({
            message: "Joined organization successfully",
        });

    } catch (error) {
        console.error("Accept Invite Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyOrganizations = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId).populate({
            path: "memberships.organization",
            select: "name slug membersCount description isActive owner createdAt",
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔹 Format response
        const organizations = user.memberships
            .filter(m => m.organization) // Filter out deleted organizations
            .map((m) => ({
                organizationId: m.organization._id,
                name: m.organization.name,
                slug: m.organization.slug,
                description: m.organization.description || "",
                isActive: m.organization.isActive,
                membersCount: m.organization.membersCount,
                role: m.role,
                isOwner: m.organization.owner.toString() === userId.toString(),
                joinedAt: m.joinedAt,
                createdAt: m.organization.createdAt,
            }));

        return res.status(200).json({
            organizations,
        });

    } catch (error) {
        console.error("Get Orgs Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};