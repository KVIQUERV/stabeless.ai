const adminAuth = require("../middlewares/adminAuth.js");
const User = require("../user/User.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();

router.get("/admin/login", (req, res) => {
    res.render("login/admin.ejs", { errorMsg: req.flash("error") });
});

router.post("/admin/authenticate", (req, res) => {
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
                    return res.redirect("/admin/login");
                }

                if (!user.fl_isAdmin) {
                    req.flash(
                        "error",
                        "Usuário não autorizado, contate um administrador!"
                    );
                    return res.redirect("/admin/login");
                }

                req.session.user = {
                    id: user.id,
                    name: user.ds_name,
                    email: user.ds_email,
                    isAdmin: user.fl_isAdmin,
                };

                return res.redirect("/admin/users");
            } else {
                req.flash(
                    "error",
                    "Usuário ou senha incorretos, tente novamente!"
                );
                return res.redirect("/admin/login");
            }
        } else {
            req.flash(
                "error",
                "Usuário não encontrado, contate um administrador!"
            );
            return res.redirect("/admin/login");
        }
    });
});

router.get("/admin/logout", adminAuth, (req, res) => {
    req.session.user = null;
    res.redirect("/admin/login");
});

module.exports = router;
