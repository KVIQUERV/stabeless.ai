const connection = require("../database/database.js");
const sequelize = require("sequelize");

const Chat = connection.define("tb_chats", {
    id_user: {
      type: sequelize.INTEGER,
      allowNull: false  
    },
    ds_message: {
        type: sequelize.TEXT("long"),
        allowNull: false
    },
    ds_sendedBy: {
        type: sequelize.STRING,
        allowNull: false
    }
});

// Chat.sync({ force: true });

module.exports = Chat;