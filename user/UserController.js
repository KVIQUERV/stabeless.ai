const adminAuth = require("../middlewares/adminAuth.js");
const Chat = require("../chat/Chat.js");
const bcrypt = require("bcryptjs");
const express = require("express");
const User = require("./User.js");
const router = express.Router();

router.post("/register", (req, res) => {
    const { txt_name, txt_email, txt_password } = req.body;

    User.findOne({
        where: {
            ds_email: txt_email,
        },
    }).then((user) => {
        if (!user) {
            const passwordSalt = bcrypt.genSaltSync(10);
            const txt_passwordHashed = bcrypt.hashSync(
                txt_password,
                passwordSalt
            );

            User.create({
                ds_name: txt_name,
                ds_email: txt_email.toLowerCase(),
                ds_password: txt_passwordHashed,
                fl_isAdmin: 0,
                fl_isDarkMode: 1,
                fl_isActive: 1,
            })
                .then((user) => {
                    req.session.user = {
                        id: user.id,
                        email: user.ds_email,
                    };

                    req.flash("isFirstLogin", true);
                    req.session.isFirstLogin = req.flash("isFirstLogin");
                    req.flash("success", "Usuário criado com sucesso!");
                    res.redirect("/login");
                })
                .catch((err) => {
                    console.log(err);
                    req.flash(
                        "error",
                        "Ocorreu um erro ao cadastrar o usuário!"
                    );
                    res.redirect("/login");
                });
        } else {
            req.flash("error", "E-mail já registrado!");
            res.redirect("/login");
        }
    });
});

router.get("/admin/users", adminAuth, (req, res) => {
    User.findAll().then((users) => {
        res.render("admin/users/listUsers.ejs", {
            users,
            loggedUser: req.session.user,
            errorMsg: req.flash("error"),
            successMsg: req.flash("success"),
        });
    });
});

router.get("/admin/users/create", adminAuth, (req, res) => {
    res.render("admin/users/createUser.ejs", { loggedUser: req.session.user });
});

router.post("/admin/users/create", adminAuth, (req, res) => {
    const { txt_name, txt_email, txt_password, cmb_isAdmin } = req.body;

    User.findOne({
        where: {
            ds_email: txt_email,
        },
    }).then((user) => {
        if (!user) {
            const passwordSalt = bcrypt.genSaltSync(10);
            const txt_passwordHashed = bcrypt.hashSync(
                txt_password,
                passwordSalt
            );

            User.create({
                ds_name: txt_name,
                ds_email: txt_email.toLowerCase(),
                ds_password: txt_passwordHashed,
                fl_isAdmin: cmb_isAdmin,
                fl_isDarkMode: 1,
                fl_isActive: 1,
            })
                .then(() => {
                    req.flash("success", "Usuário criado com sucesso!");
                    res.redirect("/admin/users");
                })
                .catch(() => {
                    req.flash("error", "Ocorreu um erro ao criar o usuário!");
                    res.redirect("/admin/users");
                });
        } else {
            req.flash("error", "Já existe um usuário com este e-mail!");
            res.redirect("/admin/users");
        }
    });
});

router.get("/admin/users/update/:id", adminAuth, (req, res) => {
    if (!req.params.id) {
        res.redirect("/admin/users");
    }

    User.findOne({
        where: {
            id: req.params.id,
        },
    }).then((user) => {
        if (user) {
            res.render("admin/users/updateUser.ejs", {
                user,
                loggedUser: req.session.user,
            });
        } else {
            res.redirect("/admin/users");
        }
    });
});

router.post("/admin/users/update", adminAuth, (req, res) => {
    const data = {};

    if (req.body.txt_name) {
        data.ds_name = req.body.txt_name;
    }

    if (req.body.txt_email) {
        data.ds_email = req.body.txt_email;
    }

    if (req.body.txt_password) {
        const passwordSalt = bcrypt.genSaltSync(10);
        const txt_passwordHashed = bcrypt.hashSync(
            req.body.txt_password,
            passwordSalt
        );

        data.ds_password = txt_passwordHashed;
    }

    if (req.body.cmb_isAdmin) {
        data.fl_isAdmin = req.body.cmb_isAdmin;
    }

    if (req.body.cmb_isActive) {
        data.fl_isActive = req.body.cmb_isActive;
    }

    User.update(data, {
        where: {
            id: req.body.id_user,
        },
    })
        .then((user) => {
            req.flash("success", "Usuário atualizado com sucesso!");
            res.redirect("/admin/users");
        })
        .catch((err) => {
            req.flash("error", "Ocorreu um erro ao atualizar o usuário!");
            res.redirect("/admin/users");
        });
});

router.delete("/admin/users", async (req, res) => {
    const { id_user } = req.body;

    User.destroy({
        where: {
            id: id_user,
        },
    })
        .then(() =>
            Chat.destroy({
                where: {
                    id_user,
                },
            })
                .then(() =>
                    res
                        .status(200)
                        .json({
                            success: true,
                            message: "Usuário deletado com sucesso!",
                        })
                )
                .catch(() =>
                    res
                        .status(500)
                        .json({
                            success: false,
                            message: "Erro ao deletar o chat!",
                        })
                )
        )
        .catch(() =>
            res
                .status(500)
                .json({ success: false, message: "Erro ao deletar o usuário!" })
        );
});

module.exports = router;
