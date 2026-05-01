import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import { sendVerificationEmail, sendResetPasswordEmail } from "../services/mail.service.js";
import buildVerifyPage from "../utils/verifyPage.js";
import config from "../config/config.js";
import { OAuth2Client } from "google-auth-library";

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

let googleClient;
const getGoogleClient = () => {
  if (!googleClient) {
    googleClient = new OAuth2Client(config.GOOGLE_CLIENT_ID);
  }
  return googleClient;
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
      isEmailVerified: false,
    });

     // 🔹 6. Send verification email
     await sendVerificationEmail({ name: user.name, email: user.email, token: emailToken });

     // 🔹 7. Prepare response (avoid sending sensitive fields)
     const userResponse = {
       _id: user._id,
       name: user.name,
       email: user.email,
       isEmailVerified: user.isEmailVerified,
       createdAt: user.createdAt,
     };

     // 🔹 8. Success Response
    return res.status(201).json({
      message: "Account created successfully. Please verify your email.",
      user: userResponse,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({ message: "An unexpected error occurred. Please try again later." });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send(buildVerifyPage({
        success: false,
        title: 'Invalid Link',
        message: 'Verification token is missing.',
      }));
    }

    // Find user by verification token
    // We first search by token alone to handle reloads/already verified cases gracefully
    const user = await userModel.findOne({
      emailVerificationToken: token
    });

    if (!user) {
      return res.status(404).send(buildVerifyPage({
        success: false,
        title: 'Invalid Link',
        message: 'This verification link is invalid. It may have been replaced by a newer link.',
        showResend: true,
      }));
    }

    // Case 1: Already Verified (handles reloads)
    if (user.isEmailVerified) {
      return res.status(200).send(buildVerifyPage({
        success: true, // We show success because they ARE verified
        title: 'Already Verified',
        message: 'Your email is already verified. You can log in to your Beacon account.',
        showResend: false,
      }));
    }

    // Case 2: Link Expired
    if (user.emailVerificationExpires < Date.now()) {
      return res.status(410).send(buildVerifyPage({
        success: false,
        title: 'Link Expired',
        message: 'This verification link has expired. Please request a new one.',
        showResend: true,
      }));
    }

    // Case 3: Fresh Verification
    // Mark email as verified
    user.isEmailVerified = true;
    // Note: We keep the token in the DB temporarily so reloads show "Already Verified"
    // instead of "Invalid Link", but we can clear the expiry.
    user.emailVerificationExpires = undefined;
    await user.save();

    // 🔹 Optional: Auto login after verification
    // We wrap this in try-catch so that even if token generation fails,
    // the user still sees the success page (since they are verified in DB)
    try {
      if (config.ACCESS_TOKEN_SECRET) {
        const accessToken = generateAccessToken(user._id);
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: config.NODE_ENV === "production",
          sameSite: "Strict",
          maxAge: 15 * 60 * 1000,
        });
      }
    } catch (tokenError) {
      console.error("Auto-login failed after verification:", tokenError);
    }

    return res.status(200).send(buildVerifyPage({
      success: true,
      title: 'Email Verified',
      message: 'Your email has been verified successfully. You can now log in to your Beacon account.',
      showResend: false,
    }));

  } catch (error) {
    console.error("Email Verification Error:", error);
    return res.status(500).send(buildVerifyPage({
      success: false,
      title: 'Error',
      message: 'An error occurred during verification. Please try again.',
    }));
  }
};

export const resendVerificationController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send(buildVerifyPage({
        success: false,
        title: 'Error',
        message: 'Email is required to resend verification.',
        showResend: true,
      }));
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).send(buildVerifyPage({
        success: false,
        title: 'User Not Found',
        message: 'No account found with this email address.',
        showResend: true,
      }));
    }

    if (user.isEmailVerified) {
      return res.status(400).send(buildVerifyPage({
        success: false,
        title: 'Already Verified',
        message: 'This email is already verified. You can log in to your account.',
        showResend: false,
      }));
    }

    // Generate new token and update user
    const newToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = newToken;
    user.emailVerificationExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await user.save();

    // Send new verification email
    await sendVerificationEmail({ name: user.name, email: user.email, token: newToken });

    return res.status(200).send(buildVerifyPage({
      success: true,
      title: 'Email Sent',
      message: `A new verification link has been sent to ${user.email}. Please check your inbox.`,
      showResend: false,
    }));
  } catch (error) {
    console.error("Resend Verification Error:", error);
    return res.status(500).send(buildVerifyPage({
      success: false,
      title: 'Error',
      message: 'An error occurred while resending the verification email. Please try again later.',
      showResend: true,
    }));
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

export const forgotPassword = async (req, res) => {
  try {
    // 🔹 1. Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { email } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await userModel.findOne({ email: normalizedEmail });

    // 🔹 2. Prevent email enumeration attack
    if (!user) {
      console.info(`Forgot password attempt for non-existent email address`);
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // 🔹 3. Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 🔹 4. Hash token before saving (Security Best Practice)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 1000 * 60 * 15; // 15 min

    await user.save();

    // 🔹 5. Send Reset Email
    await sendResetPasswordEmail({ 
      name: user.name, 
      email: user.email, 
      resetToken: resetToken 
    });

    console.info(`Password reset token generated for user: ${user._id}`);

    return res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    // 🔹 1. Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors.array().map(err => ({ field: err.path, message: err.msg }))
      });
    }

    const { token, newPassword } = req.body;

    // 🔹 2. Hash incoming token to compare with stored hash
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // 🔹 3. Find valid token
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      console.warn(`Invalid or expired password reset attempt`);
      return res.status(400).json({
        message: "Token invalid or expired",
      });
    }

    // 🔹 4. Hash new password (12 rounds)
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(newPassword, salt);

    // 🔹 5. Cleanup tokens
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    // 🔹 6. Invalidate all sessions (IMPORTANT)
    user.refreshTokens = [];

    await user.save();

    console.info(`Password successfully reset for user: ${user._id}`);

    return res.status(200).json({
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    // 🔹 userId comes from auth middleware (decoded JWT)
    const userId = req.userId;

    const user = await userModel.findById(userId)
      .select("-password -refreshTokens -passwordResetToken -emailVerificationToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user,
    });

  } catch (error) {
    console.error("GetMe Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body; // ID token from frontend

    if (!credential) {
      return res.status(400).json({ message: "No credential provided" });
    }

    // 🔹 1. Verify token with Google
    const client = getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: config.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
      return res.status(401).json({ message: "Google email not verified" });
    }

    // 🔹 2. Find user
    let user = await userModel.findOne({ email });

    // 🔹 3. Create or update user
    if (!user) {
      user = await userModel.create({
        name,
        email,
        avatar: picture,
        authProvider: "google",
        providerId: googleId,
        isEmailVerified: true,
      });
    } else {
      // If user exists, ensure they are linked to Google or allow login
      // Update avatar if it's missing
      if (!user.avatar) user.avatar = picture;
      
      // If the user was previously local, we can "upgrade" them or just allow login
      // since Google verified the email.
      if (user.authProvider === "local") {
        user.authProvider = "google";
        user.providerId = googleId;
      }
      user.isEmailVerified = true;
      await user.save();
    }

    // 🔹 4. Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    // 🔹 5. Set cookies
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Google login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(401).json({ message: "Invalid Google token" });
  }
};
