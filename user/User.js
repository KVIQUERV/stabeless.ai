const connection = require("../database/database.js");
const sequelize = require("sequelize");

const User = connection.define("tb_users", {
    ds_name: {
        type: sequelize.STRING,
        allowNull: false,
    },
    ds_email: {
        type: sequelize.STRING,
        allowNull: false,
    },
    ds_password: {
        type: sequelize.STRING,
        allowNull: false,
    },
    fl_isAdmin: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    fl_isDarkMode: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
    fl_isActive: {
        type: sequelize.INTEGER,
        allowNull: false,
    },
});

User.sync({ force: true });

module.exports = User;
