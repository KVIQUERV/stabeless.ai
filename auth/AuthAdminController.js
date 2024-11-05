const adminAuth = require("../middlewares/adminAuth.js");
const User = require("../user/User.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

router.get("/admin/login", (req, res) => {
    res.render("login/admin.ejs");
});

router.post("/admin/authenticate", (req, res) => {
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
                res.redirect("/admin/login");
            };
        } else {
            res.redirect("/admin/login");
        };
    });
});

router.get("/admin/logout", adminAuth, (req, res) => {
    req.session.user = null;
    res.redirect("/admin/login");
});

module.exports = router;