const userAuth = require("../middlewares/userAuth.js");
const Chat = require("../chat/Chat.js");
const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

router.get("/chat", /*userAuth,*/(req, res) => {
    // const userId = req.session.user.id;
    const userId = 1;

    Chat.findAll({
        where: {
            id_user: userId
        }
    }).then(messages => {
        res.render("chat/index.ejs", { userId, messages });
    });
});

router.post("/sendMessage", async (req, res) => {
    try {
        const { id_user, ds_message } = req.body;

        Chat.findAll({
            where: {
                id_user
            }
        }).then(async dbMessages => {
            const messages = dbMessages.map(message => {
                const { ds_message: content, ds_sendedBy } = message.dataValues;
                const role = ds_sendedBy === "user" ? ds_sendedBy : "assistant";
                return { role, content };
            });

            messages.push({ role: "user", content: ds_message });

            const { data: response } = await axios.post("https://api.openai.com/v1/chat/completions", {
                model: "gpt-3.5-turbo",
                messages,
                max_tokens: 4096,
                temperature: 1
            },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.API_KEY}`
                    }
                }
            );
    
            Chat.create({
                id_user,
                ds_message,
                ds_sendedBy: "user"
            }).then().catch((err) => {
                console.log("[POST] /sendMessage - ERROR | ", err);
            });
    
            const chatReplied = response.choices[0].message.content.trim();
    
            Chat.create({
                id_user,
                ds_message: chatReplied,
                ds_sendedBy: "stabeless.ai"
            }).then().catch((err) => {
                console.log("[POST] /sendMessage - ERROR | ", err);
            });

            res.json({ chatReplied });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ err });
    }
});

router.post("/deleteChat", async (req, res) => {
    try {
        const { id_user } = req.body;

        Chat.destroy({
            where: {
                id_user
            }
        })
        .then(res.status(200).json({ message: "Successfull delete" }))
        .catch(err => res.status(500).json(err));
    } catch (err) {
        console.error(err);
        res.status(500).json({ err });
    }
});

module.exports = router;