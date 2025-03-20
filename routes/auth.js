const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const { User } = require("../models/user");
const { User } = require("../models"); // Ensure this matches models/index.js
require("dotenv").config();

const router = express.Router();

// User registration
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
    //   username,
      email,
      password_digest: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("❌ Registration Error:", error); // Log the actual error
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
});

// User login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password_digest);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("❌ Login Error:", error); // Log the actual error
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

module.exports = router;
