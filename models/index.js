const { Sequelize, DataTypes } = require("sequelize");
const config = require("../config/database"); // Ensure this exists

const sequelize = new Sequelize(
  config.development.database,
  config.development.username,
  config.development.password,
  {
    host: config.development.host,
    dialect: config.development.dialect,
  }
);

const db = { sequelize, Sequelize };

db.User = require("./user")(sequelize, DataTypes);

module.exports = db;
