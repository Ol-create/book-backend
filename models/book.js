"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.Author, { foreignKey: "authorId" });
      Book.hasMany(models.Chapter, { foreignKey: "bookId" });
      Book.hasMany(models.Purchase, { foreignKey: "bookId" });
      Book.hasMany(models.Review, { foreignKey: "bookId" });
    }
  }

  Book.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Book",
    }
  );

  return Book;
};
