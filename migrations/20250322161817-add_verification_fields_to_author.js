"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Authors", "isVerified", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Authors", "verificationToken", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Authors", "isVerified"),
      queryInterface.removeColumn("Authors", "verificationToken"),
    ]);
  },
};
