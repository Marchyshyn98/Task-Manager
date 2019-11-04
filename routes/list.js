const express = require("express");
const router = express.Router();
const models = require("../models");

router.get("/", async (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    try {
        const tasks = await models.Task.find({})
            .populate("owner")
            .sort({ createdAt: -1 });

        const users = await models.User.find({});

        res.render("index", {
            tasks,
            users,
            user: {
                id: userId,
                login: userLogin
            }
        });
    } catch (error) {
        throw new Error("Server Error!");
    }
});

router.get("/tasks/:task", async (req, res, next) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const url = req.params.task.trim().replace(/ +(?= )/g, ''); // беремо параметри з адреси сторінки

    if (!url) {
        const err = new Error('Not Found');
        err.status = 404;
        next(err);
    } else {
        try {
            const task = await models.Task.findOne({
                url
            })
                .populate("owner");

            if (!task) {
                const err = new Error('Not Found');
                err.status = 404;
                next(err);
            } else {
                res.render("task/task", {
                    task,
                    user: {
                        id: userId,
                        login: userLogin
                    }
                });
            }
        } catch (error) {
            throw new Error("Server Error");
        }
    }
});

module.exports = router;