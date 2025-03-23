const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit");

const { Listener, Admin, Author } = require("../models"); // Import models
require("dotenv").config();

const router = express.Router();


// Configure email transporter (Use your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // Your email password
  },
});

// User Registration (Listeners, Admins, Authors)
router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ message: "Invalid role specified" });

    const existingUser = await Model.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate a JWT-based verification token (expires in 24 hours)
    const verificationToken = jwt.sign(
      { email, role }, // Store both email and role
      process.env.JWT_SECRET,
      { expiresIn: "2m" }
    );

    // Create user (unverified)
    newUser = await Model.create({
      email,
      password_digest: hashedPassword,
      verificationToken,
      isVerified: false,
    });

    // Send verification email
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



router.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, role } = decoded;

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ error: "Invalid role" });

    // Find user by email and role
    const user = await Model.findOne({ where: { email } });
    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    // Verify user
    user.isVerified = true;
    user.verificationToken = null; // Remove token after verification
    await user.save();

    res.json({ message: "Email verified successfully. You can now log in." });
  } catch (error) {
    res.status(500).json({ error: "Verification failed" });
  }
});





// Rate limit: Allow 3 requests per hour per IP
const resendEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Max 3 requests per hour
  message: {
    status: 429,
    message: "Too many requests. Please try again in an hour.",
  },
  standardHeaders: true, 
  legacyHeaders: false,
});


// Resend Verification Email Route
router.post("/resend-verification", resendEmailLimiter, async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ message: "Invalid role specified" });

    // Find the user
    const user = await Model.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "User is already verified" });
    }

    // Generate a new verification token
    const verificationToken = jwt.sign(
      { email, role },
      process.env.JWT_SECRET,
      { expiresIn: "1m" }
    );

    // Update the user's verificationToken
    user.verificationToken = verificationToken;
    await user.save();

    // Send new verification email
    const verificationLink = `${process.env.BASE_URL}/auth/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Resend Verification Email",
      html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
    });

    res
      .status(200)
      .json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});




router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ message: "Invalid role specified" });

    const user = await Model.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



//Request Password Reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email || !role) {
      return res.status(400).json({ message: "Email and role are required" });
    }

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ message: "Invalid role specified" });

    const user = await Model.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate a password reset token (JWT)
    const resetToken = jwt.sign(
      { email, role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Token expires in 15 minutes
    );

    // Send reset email
    const resetLink = `${process.env.BASE_URL}/auth/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    });

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// frontend to handle GET /reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    // Verify the token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const { email, role } = decoded;

    let Model;
    if (role === "listener") Model = Listener;
    else if (role === "admin") Model = Admin;
    else if (role === "author") Model = Author;
    else return res.status(400).json({ message: "Invalid role specified" });

    const user = await Model.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password_digest = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});



// Logout (Clears token on frontend)
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});





module.exports = router;
