const express = require("express");
const router = express.Router();
const User = require("./User.js");

router.get("/admin/users", (req, res) => {
    res.render("./admin/users/listUsers.ejs");
});

router.get("/admin/users/create", (req, res) => {
    res.render("./admin/users/createUser.ejs");
});

module.exports = router;