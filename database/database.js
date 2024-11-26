const sequelize = require("sequelize");

const connection = new sequelize("db_stabeless.ai", "root", "983503401", {
    host: "localhost",
    dialect: "mysql",
});

module.exports = connection;
