import mongoose from "mongoose";
import { validationResult } from "express-validator";
import incidentModel from "../../models/incident.model.js";
import userModel from "../../models/user.model.js";
import incidentUpdateModel from "../../models/incidentUpdate.model.js";

export const assignUsersToIncident = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
      });
    }

    const { id } = req.params; // incidentId
    const { userIds } = req.body;
    const requesterId = req.userId;

    const incident = await incidentModel.findById(id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status === "resolved") {
      return res.status(400).json({ message: "Cannot change assignments on a resolved incident" });
    }

    // 🔹 Check requester belongs to org
    const requester = await userModel.findOne({
      _id: requesterId,
      "memberships.organization": incident.organization,
    });

    if (!requester) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Role restriction
    const membership = requester.memberships.find(
      (m) => m.organization.toString() === incident.organization.toString()
    );

    if (membership.role === "viewer") {
      return res.status(403).json({
        message: "Viewers cannot assign users",
      });
    }

    // 🔹 Validate users belong to same org
    const validUsers = await userModel.find({
      _id: { $in: userIds },
      "memberships.organization": incident.organization,
    }).select("_id name");

    if (validUsers.length === 0) {
      return res.status(400).json({
        message: "No valid users found to assign",
      });
    }

    const validUserIds = validUsers.map((u) => u._id);
    const validUserNames = validUsers.map((u) => u.name).join(", ");

    // 🔹 Check for users already assigned to avoid redundant updates/logs
    const alreadyAssigned = incident.assignedUsers.map(u => u.toString());
    const newToAssign = validUserIds.filter(uid => !alreadyAssigned.includes(uid.toString()));

    if (newToAssign.length === 0) {
      return res.status(400).json({
        message: "All specified users are already assigned",
      });
    }

    // 🔹 Update incident using $addToSet for atomicity
    const updatedIncident = await incidentModel.findByIdAndUpdate(
      id,
      { $addToSet: { assignedUsers: { $each: newToAssign } } },
      { returnDocument: 'after' }
    );

    // 🔹 Add audit log
    await incidentUpdateModel.create({
      incident: id,
      message: `Assigned users: ${validUserNames}`,
      createdBy: requesterId,
    });

    return res.status(200).json({
      message: "Users assigned successfully",
      assignedUsers: updatedIncident.assignedUsers,
    });

  } catch (error) {
    console.error("Assign Users Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const unassignUsersFromIncident = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
      });
    }

    const { id } = req.params; // incidentId
    const { userIds } = req.body;
    const requesterId = req.userId;

    const incident = await incidentModel.findById(id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.status === "resolved") {
      return res.status(400).json({ message: "Cannot change assignments on a resolved incident" });
    }

    // 🔹 Check requester belongs to org
    const requester = await userModel.findOne({
      _id: requesterId,
      "memberships.organization": incident.organization,
    });

    if (!requester) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Role restriction
    const membership = requester.memberships.find(
      (m) => m.organization.toString() === incident.organization.toString()
    );

    if (membership.role === "viewer") {
      return res.status(403).json({
        message: "Viewers cannot unassign users",
      });
    }

    // 🔹 Filter userIds that are actually assigned
    const alreadyAssigned = incident.assignedUsers.map((u) => u.toString());
    const toRemove = userIds.filter((uid) => alreadyAssigned.includes(uid));

    if (toRemove.length === 0) {
      return res.status(400).json({
        message: "None of the specified users are currently assigned",
      });
    }

    // 🔹 Get names for audit log
    const removedUsers = await userModel.find({ _id: { $in: toRemove } }).select("name");
    const removedUserNames = removedUsers.map(u => u.name).join(", ");

    // 🔹 Update incident using $pull for atomicity
    const updatedIncident = await incidentModel.findByIdAndUpdate(
      id,
      { $pull: { assignedUsers: { $in: toRemove } } },
      { returnDocument: 'after' }
    );

    // 🔹 Add audit log
    await incidentUpdateModel.create({
      incident: id,
      message: `Unassigned users: ${removedUserNames}`,
      createdBy: requesterId,
    });

    return res.status(200).json({
      message: "Users unassigned successfully",
      assignedUsers: updatedIncident.assignedUsers,
    });

  } catch (error) {
    console.error("Unassign Users Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getIncidentResponders = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
      });
    }

    const { id } = req.params;
    const userId = req.userId;

    // 🔹 Get incident with populated responders
    const incident = await incidentModel.findById(id)
      .populate("assignedUsers", "name email avatar memberships")
      .lean();

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    // 🔹 Check requester belongs to org (using .some for performance on lean object)
    const requester = await userModel.findOne({
      _id: userId,
      "memberships.organization": incident.organization,
    }).lean();

    if (!requester) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 🔹 Format responders
    const responders = incident.assignedUsers.map((u) => {
      const membership = u.memberships.find(
        (m) => m.organization.toString() === incident.organization.toString()
      );

      return {
        userId: u._id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        role: membership?.role || "unknown",
      };
    });

    return res.status(200).json({
      responders,
    });

  } catch (error) {
    console.error("Get Responders Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};