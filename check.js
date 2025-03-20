require("dotenv").config();

console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USERNAME:", process.env.DB_USERNAME);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "✔️ Set" : "❌ Not Set");
console.log("DB_HOST:", process.env.DB_HOST);
