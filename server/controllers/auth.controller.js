import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";

export const signup = async (req, res) => {
  try {
    // 🔹 1. Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { name, email, password } = req.body;

    // 🔹 2. Check existing user (redundant but safe)
    const normalizedEmail = email.toLowerCase();
    const existingUser = await userModel.findOne({
      email: normalizedEmail,
    });
    if (existingUser) {
      // Security note: In some contexts, you might want to return a generic 201
      // to avoid email enumeration, but for signup 409 is standard.
      return res.status(409).json({ message: "User with this email already exists" });
    }

    // 🔹 3. Hash password
    // Using 12 rounds for better security (standard is 10-12)
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 🔹 4. Email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");

    // 🔹 5. Create user
    const user = await userModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      emailVerificationToken: emailToken,
      emailVerificationExpires: Date.now() + 1000 * 60 * 60, // 1 hour
    });

    // 🔹 6. Prepare response (avoid sending sensitive fields)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
    };

    // 🔹 7. Success Response
    return res.status(201).json({
      message: "Account created successfully. Please verify your email.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    // Generic error message to avoid leaking server details
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
  }
};
