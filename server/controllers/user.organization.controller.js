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

export const getOrganizationById = async (req, res) => {
    try {
        // 1. Validation
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { id } = req.params;
        const userId = req.userId;

        // 2. Check membership (IMPORTANT for authorization)
        const user = await userModel.findOne({
            _id: userId,
            "memberships.organization": id,
        });

        if (!user) {
            return res.status(403).json({ message: "Access denied" });
        }

        // 3. Get organization details
        const organization = await organizationModel.findById(id);

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // 4. Get members with specific roles in THIS organization
        const members = await userModel.find({
            "memberships.organization": id,
        }).select("name avatar memberships");

        // 5. Format members list
        const formattedMembers = members.map((m) => {
            const membership = m.memberships.find(
                (mem) => mem.organization.toString() === id
            );

            return {
                userId: m._id,
                name: m.name,
                avatar: m.avatar,
                role: membership.role,
                joinedAt: membership.joinedAt,
            };
        });

        return res.status(200).json({
            organization: {
                id: organization._id,
                name: organization.name,
                slug: organization.slug,
                description: organization.description || "",
                isActive: organization.isActive,
                membersCount: organization.membersCount,
                owner: organization.owner,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt,
            },
            members: formattedMembers,
        });

    } catch (error) {
        console.error("Get Org Details Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateMemberRole = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { orgId, userId } = req.params;
        const { role } = req.body;
        const requesterId = req.userId;

        // 1. Check organization existence and owner
        const organization = await organizationModel.findById(orgId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // 2. Check requester permissions (must be admin)
        const requester = await userModel.findOne({
            _id: requesterId,
            "memberships.organization": orgId,
            "memberships.role": "admin",
        });

        if (!requester) {
            return res.status(403).json({ message: "Only admins can update roles" });
        }

        // 3. Prevent changing owner's role
        if (organization.owner.toString() === userId) {
            return res.status(403).json({ message: "Organization owner's role cannot be changed" });
        }

        // 4. Self-demotion check (must not leave org with no admins)
        if (requesterId === userId && role !== "admin") {
            const adminCount = await userModel.countDocuments({
                "memberships.organization": orgId,
                "memberships.role": "admin",
            });
            if (adminCount <= 1) {
                return res.status(400).json({ message: "Cannot demote the only admin" });
            }
        }

        // 5. Get current user membership to check if change is needed and for audit log
        const targetUser = await userModel.findOne({
            _id: userId,
            "memberships.organization": orgId
        }, { "memberships.$": 1 });

        if (!targetUser) {
            return res.status(404).json({ message: "User not in organization" });
        }

        const oldRole = targetUser.memberships[0].role;
        if (oldRole === role) {
            return res.status(200).json({ message: "Role is already set to this value" });
        }

        // 6. Update role
        const user = await userModel.findOneAndUpdate(
            {
                _id: userId,
                "memberships.organization": orgId,
            },
            {
                $set: {
                    "memberships.$.role": role,
                },
            },
            { new: true }
        );

        // 7. Audit Log
        console.info(`[AUDIT] User ${requesterId} updated role of User ${userId} in Organization ${orgId} from ${oldRole} to ${role}`);

        return res.status(200).json({
            message: "Member role updated successfully",
            oldRole,
            newRole: role
        });

    } catch (error) {
        console.error("Update Member Role Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { orgId, userId } = req.params;
        const requesterId = req.userId;

        // 1. Check organization existence
        const organization = await organizationModel.findById(orgId).session(session);
        if (!organization) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Organization not found" });
        }

        // 2. Authorization Logic: Admin removing someone OR User leaving
        const isSelfRemoval = requesterId === userId;
        
        const requester = await userModel.findOne({
            _id: requesterId,
            "memberships.organization": orgId,
        }).session(session);

        if (!requester) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "You are not a member of this organization" });
        }

        const requesterMembership = requester.memberships.find(m => m.organization.toString() === orgId);
        const isAdmin = requesterMembership.role === "admin";

        if (!isAdmin && !isSelfRemoval) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: "Only admins can remove other members" });
        }

        // 3. Prevent removing/leaving for the Owner
        if (organization.owner.toString() === userId) {
            await session.abortTransaction();
            session.endSession();
            const msg = isSelfRemoval 
                ? "Organization owner cannot leave the organization. Transfer ownership first." 
                : "Organization owner cannot be removed.";
            return res.status(403).json({ message: msg });
        }

        // 4. If self-demoting/leaving as the only admin, check if others exist
        if (isSelfRemoval && isAdmin) {
            const adminCount = await userModel.countDocuments({
                "memberships.organization": orgId,
                "memberships.role": "admin",
            }).session(session);
            
            if (adminCount <= 1) {
                const totalMembers = await userModel.countDocuments({
                    "memberships.organization": orgId
                }).session(session);

                if (totalMembers > 1) {
                    await session.abortTransaction();
                    session.endSession();
                    return res.status(400).json({ message: "Cannot leave as the only admin while other members exist. Promote another member first." });
                }
            }
        }

        // 5. Execute removal
        const user = await userModel.findOneAndUpdate(
            { _id: userId, "memberships.organization": orgId },
            { $pull: { memberships: { organization: orgId } } },
            { new: true, session }
        );

        if (!user) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ message: "Member not found in this organization" });
        }

        // 6. Decrement members count
        await organizationModel.findByIdAndUpdate(orgId, {
            $inc: { membersCount: -1 },
        }, { session });

        await session.commitTransaction();
        session.endSession();

        // 7. Audit Log
        const action = isSelfRemoval ? "left" : `removed User ${userId} from`;
        console.info(`[AUDIT] User ${requesterId} ${action} Organization ${orgId}`);

        return res.status(200).json({
            message: isSelfRemoval ? "You have left the organization" : "Member removed successfully",
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("Remove Member Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const updateOrganization = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: "Validation failed",
                errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
            });
        }

        const { id } = req.params;
        const { name, description } = req.body;
        const userId = req.userId;

        // 1. Check admin access
        const requester = await userModel.findOne({
            _id: userId,
            "memberships.organization": id,
            "memberships.role": "admin",
        });

        if (!requester) {
            return res.status(403).json({ message: "Only admins can update organization details" });
        }

        // 2. Prepare update data
        const updateData = {};
        if (name) {
            updateData.name = name.trim();
            // Optional: Update slug if name changes
            const baseSlug = slugify(updateData.name, { lower: true, strict: true });
            let slug = baseSlug;
            let existing = await organizationModel.findOne({ slug, _id: { $ne: id } });
            let counter = 1;
            while (existing) {
                slug = `${baseSlug}-${counter++}`;
                existing = await organizationModel.findOne({ slug, _id: { $ne: id } });
            }
            updateData.slug = slug;
        }
        if (description !== undefined) {
            updateData.description = description.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: "No update data provided" });
        }

        // 3. Update organization
        const organization = await organizationModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // 4. Audit Log
        console.info(`[AUDIT] Organization ${id} updated by User ${userId}. Changes: ${Object.keys(updateData).join(", ")}`);

        return res.status(200).json({
            message: "Organization updated successfully",
            organization,
        });

    } catch (error) {
        console.error("Update Organization Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};