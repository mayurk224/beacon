import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "organizations",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["admin", "responder", "viewer"],
      default: "viewer",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only have one pending request per organization
joinRequestSchema.index({ user: 1, organization: 1, status: 1 }, { unique: true, partialFilterExpression: { status: "pending" } });

const joinRequestModel = mongoose.model("joinRequests", joinRequestSchema);

export default joinRequestModel;
