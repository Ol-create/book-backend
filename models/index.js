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

db.Admin = require("./admin")(sequelize, DataTypes);
db.Author = require("./author")(sequelize, DataTypes);
db.Book = require("./book")(sequelize, DataTypes);
db.Chapter = require("./chapter")(sequelize, DataTypes);
db.Listener = require("./listener")(sequelize, DataTypes);
db.Notification = require("./notification")(sequelize, DataTypes);
db.Purchase = require("./purchase")(sequelize, DataTypes);
db.Review = require("./review")(sequelize, DataTypes);


module.exports = db;
