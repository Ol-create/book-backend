"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    static associate(models) {
      Author.hasMany(models.Book, { foreignKey: "authorId" });
      Author.hasMany(models.Notification, { foreignKey: "userId" });
    }
  }

  Author.init(
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

      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      verificationToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Author",
    }
  );

  return Author;
};
