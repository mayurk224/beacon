import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import config from "../config/config.js";

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, config.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, config.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

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

export const login = async (req, res) => {
  try {
    // 🔹 1. Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { email, password } = req.body;

    // 🔹 2. Find user
    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 3. Check account status & lockout
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Account is temporarily locked. Please try again later.",
      });
    }

    // 🔹 4. Check password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      user.loginAttempts += 1;
      if (user.loginAttempts >= MAX_ATTEMPTS) {
        user.lockUntil = Date.now() + LOCK_TIME;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔹 5. Reset login attempts on success
    user.loginAttempts = 0;
    user.lockUntil = undefined;

    // 🔹 6. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 🔹 7. Save refresh token (for logout / revoke)
    // Cleanup expired tokens (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token.createdAt && token.createdAt > sevenDaysAgo
    );

    user.refreshTokens.push({ token: refreshToken });
    user.lastLoginAt = new Date();
    await user.save();

    // 🔹 8. Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 🔹 9. Send response (safe data only)
    return res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        memberships: user.memberships,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // 🔹 1. Remove refresh token from database
      await userModel.updateOne(
        { "refreshTokens.token": refreshToken },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    // 🔹 2. Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    // 🔹 1. Verify token
    let payload;
    try {
      payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired refresh token" });
    }

    // 🔹 2. Check database for token existence
    const user = await userModel.findOne({
      _id: payload.userId,
      "refreshTokens.token": refreshToken,
    });

    if (!user) {
      return res.status(401).json({ message: "Token revoked or user not found" });
    }

    // 🔹 3. Cleanup expired tokens (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token.createdAt && token.createdAt > sevenDaysAgo
    );
    await user.save();

    // 🔹 4. Generate new access token
    const newAccessToken = generateAccessToken(user._id);

    // 🔹 5. Set new cookie
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    console.error("Refresh Token Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    // 🔹 1. Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Invalid verification link" });
    }

    // 🔹 2. Find user by token
    const user = await userModel.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.warn(`Failed email verification attempt with token: ${token}`);
      return res.status(400).json({
        message: "Token invalid or expired",
      });
    }

    // 🔹 3. Mark verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // 🔹 4. Audit Log
    console.info(`Email verified successfully for user: ${user.email} (ID: ${user._id})`);

    // 🔹 5. (Optional) Auto login after verification
    const accessToken = jwt.sign(
      { userId: user._id },
      config.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    // 🔹 6. Redirect to frontend
    return res.redirect(`${config.CLIENT_URL}/email-verified`);

  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};