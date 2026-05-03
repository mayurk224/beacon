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
          ref: "organizations",
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
      type: Date,
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
        device: String, // optional (parsed)
        isCurrent: Boolean, // optional
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
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true },
);

userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ role: 1 });
userSchema.index({ createdAt: -1 });

const userModel = mongoose.model("users", userSchema);

export default userModel;
