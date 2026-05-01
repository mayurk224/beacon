import bcrypt from "bcryptjs";
import crypto from "crypto";
import { validationResult } from "express-validator";
import userModel from "../models/user.model.js";
import { sendVerificationEmail } from "../services/mail.service.js";
import buildVerifyPage from "../utils/verifyPage.js";

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

export const verifyEmailController = async (req, res) => {
   try {
     const { token } = req.query;

     if (!token) {
       return res.status(400).send(buildVerifyPage({
         success: false,
         title: 'Invalid Link',
         message: 'This verification link is invalid or has expired.',
       }));
     }

     // Find user by verification token
     const user = await userModel.findOne({
       emailVerificationToken: token,
       emailVerificationExpires: { $gt: Date.now() }, // Check if not expired
     });

     if (!user) {
       return res.status(404).send(buildVerifyPage({
         success: false,
         title: 'Link Expired',
         message: 'This verification link has expired. Please request a new one.',
         showResend: true,
       }));
     }

     if (user.isEmailVerified) {
       return res.status(400).send(buildVerifyPage({
         success: false,
         title: 'Already Verified',
         message: 'Your email is already verified. You can log in to your Beacon account.',
         showResend: false,
       }));
     }

     // Mark email as verified and clear token
     user.isEmailVerified = true;
     user.emailVerificationToken = null;
     user.emailVerificationExpires = null;
     await user.save();

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
