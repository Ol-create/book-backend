"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Purchase extends Model {
    static associate(models) {
      Purchase.belongsTo(models.Listener, { foreignKey: "listenerId" });
      Purchase.belongsTo(models.Book, { foreignKey: "bookId" });
    }
  }

  Purchase.init(
    {
      listenerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      bookId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Purchase",
    }
  );

  return Purchase;
};
