"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Listener extends Model {
    static associate(models) {
      Listener.hasMany(models.Purchase, { foreignKey: "listenerId" });
      Listener.hasMany(models.Review, { foreignKey: "listenerId" });
      Listener.hasMany(models.Notification, { foreignKey: "userId" });
    }
  }

  Listener.init(
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_digest: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Listener",
    }
  );

  return Listener;
};