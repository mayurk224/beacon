import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // 🔹 Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    password: {
      type: String,
      required: function () {
        return this.authProvider === "local";
      },
    },

    avatar: {
      type: String, // URL
      default: "",
    },

    avatarFileId: {
      type: String, // ImageKit fileId
      default: "",
    },

    // 🔹 Auth Provider (future-proof)
    authProvider: {
      type: String,
      enum: ["local", "google", "github"],
      default: "local",
    },

    providerId: {
      type: String, // OAuth ID
    },

    // 🔹 Organization Memberships (CRITICAL)
    memberships: [
      {
        organization: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
          required: true,
        },
        role: {
          type: String,
          enum: ["admin", "responder", "viewer"],
          default: "responder",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // 🔹 Account Status
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // 🔹 Account Lockout
    loginAttempts: {
      type: Number,
      required: true,
      default: 0,
    },

    lockUntil: {
      type: Number,
    },

    // 🔹 Security
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    twoFactorSecret: {
      type: String,
    },

    lastLoginAt: {
      type: Date,
    },

    // 🔹 Tokens (for auth flows)
    refreshTokens: [
      {
        token: String,
        createdAt: { type: Date, default: Date.now },
        userAgent: String,
        ip: String,
      }
    ],

    passwordResetToken: String,
    passwordResetExpires: Date,

    emailVerificationToken: String,
    emailVerificationExpires: Date,

    // 🔹 Preferences (nice touch for hackathon)
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        slack: { type: Boolean, default: false },
      },
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "dark",
      },
    },
  },
  { timestamps: true },
);

const userModel = mongoose.model("users", userSchema);

export default userModel;
