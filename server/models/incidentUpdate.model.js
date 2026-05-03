import mongoose from "mongoose";

const incidentUpdateSchema = new mongoose.Schema(
    {
        incident: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "incidents",
            required: true,
        },

        message: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: ["open", "investigating", "resolved"],
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
    },
    { timestamps: true }
);

const incidentUpdateModel = mongoose.model("incidentUpdate", incidentUpdateSchema);

export default incidentUpdateModel;