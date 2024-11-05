const userAuth = require("../middlewares/userAuth.js");
const User = require("../user/User.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    res.render("login/user.ejs");
});

router.post("/authenticate", (req, res) => {
    const txt_email = req.body.txt_email;
    const txt_password = req.body.txt_password;

    User.findOne({
        where: {
            ds_email: txt_email
        }
    }).then(user => {
        if (user) {
            const passwordCompare = bcrypt.compareSync(txt_password, user.ds_password);

            if (passwordCompare) {
                req.session.user = {
                    id: user.id,
                    email: user.ds_email
                };

                res.json(req.session.user);
            } else {
                res.redirect("/login");
            };
        } else {
            res.redirect("/login");
        };
    });
});

router.get("/logout", userAuth, (req, res) => {
    req.session.user = null;
    res.redirect("/login");
});

module.exports = router;