const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { Listener, Author } = require("../models"); // Removed Admin
require("dotenv").config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      passReqToCallback: true, // Enables passing req to the callback function
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const role = req.query.role; // Get role from query parameters

        if (!role || !["listener", "author"].includes(role)) {
          return done(
            new Error(
              "Invalid or missing role. Only listeners and authors can sign up."
            ),
            null
          );
        }

        let user;
        const email = profile.emails[0].value;

        // Check if user already exists in the correct role
        if (role === "listener") {
          user = await Listener.findOne({ where: { email } });
        } else if (role === "author") {
          user = await Author.findOne({ where: { email } });
        }

        // If user doesn't exist, create a new account in the correct role
        if (!user) {
          if (role === "listener") {
            user = await Listener.create({
              email,
              password_digest: "google_auth",
            });
          } else if (role === "author") {
            user = await Author.create({
              email,
              password_digest: "google_auth",
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

module.exports = passport;
