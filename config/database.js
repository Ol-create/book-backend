// const { Sequelize } = require("sequelize");
// require("dotenv").config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USERNAME,
//   process.env.DB_PASSWORD,
//   {
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     logging: true, // Optional: Disable SQL query logging
//   }
// );

// module.exports = sequelize; // ✅ Export the Sequelize instance

require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME || "your_default_username",
    password: process.env.DB_PASSWORD || "your_default_password",
    database: process.env.DB_NAME || "your_default_db_name",
    host: process.env.DB_HOST || "localhost",
    dialect: "postgres", // Ensure this is a string, NOT an object
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_TEST_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_PROD_NAME,
    host: process.env.DB_HOST,
    dialect: "postgres",
  },
};
