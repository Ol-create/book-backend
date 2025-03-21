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
        // Decode state parameter to get role
        const state = req.query.state
          ? JSON.parse(Buffer.from(req.query.state, "base64").toString())
          : {};
        const role = state.role;

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

        // Explicitly attach role to user object before returning
        user.role = role;

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, { id: user.id, role: user.role });
});

passport.deserializeUser(async (obj, done) => {
  try {
    let user;
    if (obj.role === "listener") {
      user = await Listener.findByPk(obj.id);
    } else if (obj.role === "author") {
      user = await Author.findByPk(obj.id);
    }
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
