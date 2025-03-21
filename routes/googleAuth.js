const express = require("express");
const passport = require("../middlewares/passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

router.get("/google", (req, res, next) => {
  const { role } = req.query;

  if (!role || (role !== "listener" && role !== "author")) {
    return res
      .status(400)
      .json({
        error:
          "Invalid or missing role. Only listeners and authors can sign up.",
      });
  }

  // Store role in the state parameter
  const state = Buffer.from(JSON.stringify({ role })).toString("base64");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
  const { state } = req.query;

  if (!state) {
    return res.status(400).json({ error: "Missing authentication state." });
  }

  let role;
  try {
    const decodedState = JSON.parse(Buffer.from(state, "base64").toString());
    role = decodedState.role;
  } catch (error) {
    return res.status(400).json({ error: "Invalid state parameter." });
  }

  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err ) {
      return res.status(401).json({ error: "Authentication failed." });
    }

    const profilePicture = user.photos?.[0]?.value || null;

    // Generate JWT token including role
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.displayName,
        picture: profilePicture,
        role, // Use role extracted from state
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Google authentication successful", token });
  })(req, res, next);
});

module.exports = router;
