require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/auth");
const googleAuthRoutes = require("./routes/googleAuth");
const passport = require("./middlewares/passport");
const cors = require("cors");

require("./models"); // Ensure models are loaded


const app = express();
app.use(passport.initialize());
app.use(
  cors({
    origin: "http://localhost:8080",
  })
);

const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/auth", googleAuthRoutes);


// Sync all models and start the server

  // .then(() => {
  //   console.log("✅ Database synced successfully.");
  //   app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  // })
  // .catch((error) => console.error("❌ Error syncing database:", error));

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
