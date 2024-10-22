/* -=|> Libraries/Internal Files */
const connection = require("./database/database.js");
const bodyParser = require("body-parser");
const express = require("express");

/* -=|> Express Instance */
const app = express();

app.set("view engine", "ejs"); /* -=|> View Engine */
app.use(express.static("./public")); /* -=|> Static */
app.use(bodyParser.urlencoded({ extended: false })); /* -=|> Body-Parser */
app.use(bodyParser.json()); /* -=|> Body-Parser */

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

/* -=|> Models */
const User = require("./user/User.js");

/* -=|> Controller Routes */
app.use("/", userController);

/* -=|> Internal Routes */
app.get("/", (req, res) => {
    res.render("./index.ejs");
});

/* -=|> Server Initialization */
app.listen(8080, () => {
    console.log("[ON] Server successfully initialized!");
});