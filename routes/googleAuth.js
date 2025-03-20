const express = require("express");
const passport = require("../middlewares/passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }), // Disable session
  (req, res) => {
    // Extract profile picture
    const profilePicture =
      req.user.photos && req.user.photos.length > 0
        ? req.user.photos[0].value
        : null; // Default to null if no picture

    // Include profile info in the token
    const token = jwt.sign(
      {
        id: req.user.id,
        email: req.user.email,
        name: req.user.displayName,
        picture: profilePicture, 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ message: "Google authentication successful", token });
  }
);

module.exports = router;
