const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

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

// User Login
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

    const passwordMatch = await bcrypt.compare(password, user.password_digest);
    if (!passwordMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // const token = jwt.sign({ id: user.id, role }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    //   res.status(200).json({ message: "Login successful", token });
    // } catch (error) {
    //   res.status(500).json({ message: "Server error", error: error.message });
    // }

    res.json({
      message: "Signup successful. Check your email for verification.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Signup failed" });
  }

});

// Logout (Clears token on frontend)
router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
