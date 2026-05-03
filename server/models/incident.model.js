import mongoose from "mongoose";

const incidentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["open", "investigating", "resolved"],
            default: "open",
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            required: true,
        },

        organization: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "organizations",
            required: true,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },

        assignedUsers: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "users",
            },
        ],

        resolvedAt: Date,
    },
    { timestamps: true }
);

const incidentModel = mongoose.model("incidents", incidentSchema);

export default incidentModel;