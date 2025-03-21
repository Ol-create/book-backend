"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.Listener, { foreignKey: "userId" });
      Notification.belongsTo(models.Admin, { foreignKey: "userId" });
      Notification.belongsTo(models.Author, { foreignKey: "userId" });
    }
  }

  Notification.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Notification",
    }
  );

  return Notification;
};
