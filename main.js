/* -=|> Libraries/Internal Files */
const connection = require("./database/database.js");
const session = require("express-session");
const bodyParser = require("body-parser");
const flash = require("connect-flash");
const express = require("express");

/* -=|> Express Instance */
const app = express();

app.set("view engine", "ejs"); /* -=|> View Engine */
app.use(session({ secret: "J3z(6*H_x|J5y5l7", resave: true, saveUninitialized: true, cookie: { maxAge: 604800 } })); /* -=|> Session */
app.use(express.static("./public")); /* -=|> Static */
app.use(bodyParser.urlencoded({ extended: false })); /* -=|> Body-Parser */
app.use(bodyParser.json()); /* -=|> Body-Parser */
app.use(flash()); /* -=|> Connect-flash */

/* -=|> Database Connection */
connection
    .authenticate()
    .then(() => {
        console.log("[ON] Database successfully connected!");
    })
    .catch((err) => {
        console.log(err);
    });

/* -=|> Controllers */
const userController = require("./user/UserController.js");
const authUserController = require("./auth/AuthUserController.js");
const authAdminController = require("./auth/AuthAdminController.js");
const chatController = require("./chat/ChatController.js");

/* -=|> Models */
const User = require("./user/User.js");
const Chat = require("./chat/Chat.js");

/* -=|> Controller Routes */
app.use("/", userController);
app.use("/", authUserController);
app.use("/", authAdminController);
app.use("/", chatController);

/* -=|> Internal Routes */
app.get("/", (req, res) => {
    res.render("initial/index.ejs");
});

/* -=|> Server Initialization */
app.listen(8080, () => {
    console.log("[ON] Server successfully initialized!");
});