const adminAuth = require("../middlewares/adminAuth.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("./User.js");
const router = express.Router();

router.get("/admin/users", adminAuth, (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/listUsers.ejs", { users });
    });
});

router.get("/admin/users/create", adminAuth, (req, res) => {
    res.render("admin/users/createUser.ejs");
});

router.post("/admin/users/create", adminAuth, (req, res) => {
    const txt_email = req.body.txt_email;
    const txt_password = req.body.txt_password;

    User.findOne({
        where: {
            ds_email: txt_email
        }
    }).then(user => {
        if (!user) {
            const passwordSalt = bcrypt.genSaltSync(10);
            const txt_passwordHashed = bcrypt.hashSync(txt_password, passwordSalt);

            User.create({
                ds_email: txt_email,
                ds_password: txt_passwordHashed
            }).then(() => {
                res.redirect("/admin/users");
            }).catch((err) => {
                console.log(err);
                res.redirect("/");
            });
        } else {
            res.redirect("/admin/users");
        };
    });
});

module.exports = router;