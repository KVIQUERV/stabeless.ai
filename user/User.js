const connection = require("../database/database.js");
const sequelize = require("sequelize");

const User = connection.define("users", {
    ds_email: {
        type: sequelize.STRING,
        allowNull: false
    },
    ds_password: {
        type: sequelize.STRING,
        allowNull: false
    }
});

// User.sync({ force: true });

module.exports = User;