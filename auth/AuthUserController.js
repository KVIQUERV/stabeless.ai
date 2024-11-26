const userAuth = require("../middlewares/userAuth.js");
const User = require("../user/User.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

router.get("/login", (req, res) => {
    if (req.session.user) {
        if (
            req.session.isFirstLogin &&
            req.session.isFirstLogin.length &&
            req.session.isFirstLogin[0]
        ) {
            delete req.session.isFirstLogin;
            res.render("login/user.ejs", {
                errorMsg: req.flash("error"),
                successMsg: req.flash("success"),
            });
        } else {
            res.redirect("/chat");
        }
    } else {
        res.render("login/user.ejs", {
            errorMsg: req.flash("error"),
            successMsg: req.flash("success"),
        });
    }
});

router.post("/authenticate", (req, res) => {
    const txt_email = req.body.txt_email;
    const txt_password = req.body.txt_password;

    User.findOne({
        where: {
            ds_email: txt_email,
        },
    }).then((user) => {
        if (user) {
            const passwordCompare = bcrypt.compareSync(
                txt_password,
                user.ds_password
            );

            if (passwordCompare) {
                if (!user.fl_isActive) {
                    req.flash(
                        "error",
                        "Usuário desativado, contate um administrador!"
                    );
                    return res.redirect("/login");
                }

                req.session.user = {
                    id: user.id,
                    email: user.ds_email,
                };

                res.redirect("/chat");
            } else {
                req.flash(
                    "error",
                    "Usuário ou senha incorretos, tente novamente!"
                );
                res.redirect("/login");
            }
        } else {
            req.flash(
                "error",
                "Usuário não encontrado, necessário realizar o cadastro!"
            );
            res.redirect("/login");
        }
    });
});

router.get("/logout", userAuth, (req, res) => {
    req.session.user = null;
    res.redirect("/login");
});

router.post("/logout", userAuth, (req, res) => {
    req.session.user = null;
    res.redirect("/logout");
});

module.exports = router;
