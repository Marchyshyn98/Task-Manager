const express = require("express");
const router = express.Router();
const models = require("../models");

//GET for Edit
router.get("/edit/:id", async (req, res, next) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;
    const id = req.params.id.trim().replace(/ +(?= )/g, '');

    if (!userId || !userLogin) {
        res.redirect("/");
    } else {
        try {
            const task = await models.Task.findById(id); // шукаємо оголошення в БД

            if (!task) {
                const err = new Error('Not Found');
                err.status = 404;
                next(err);
            }

            res.render("task/edit", {
                task,
                user: {
                    id: userId,
                    login: userLogin
                }
            });
        } catch (error) {
            throw new Error("Server Error");
        }
    }
});

//GET for Add
router.get("/add", (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    if (!userId || !userLogin) {
        res.redirect("/");
    } else {
        res.render("task/edit", {
            user: {
                id: userId,
                login: userLogin
            }
        });
    }
});

router.post("/add", async (req, res) => {
    const userId = req.session.userId;
    const userLogin = req.session.userLogin;

    if (!userId || !userLogin) {
        res.redirect("/");
    } else {
        const title = req.body.title.trim().replace(/ +(?= )/g, ''); // trim забирає пробіли спочатку і в кінці, replace забирає двойні пробіли і робить один
        const body = req.body.body;
        const taskId = req.body.taskId;

        console.log(taskId);

        if (!title || !body) {
            const fields = [];
            if (!title) fields.push('title');
            if (!body) fields.push('body');
            res.json({
                ok: false,
                error: "Всі поля повинні бути заповненими",
                fields
            });
        } else if (title.length < 3 || title.length > 64) {
            res.json({
                ok: false,
                error: "Довжина заголовка від 3 до 64 символів",
                fields: ['title']
            });
        } else if (body.length < 10) {
            res.json({
                ok: false,
                error: "Довжина тексту не менше 10 символів",
                fields: ['body']
            });
        } else {
            try {
                if (taskId) { // перевіряємо чи оголошення приходить з id(редагування)
                    const task = await models.Task.findOneAndUpdate( // знаходимо іd оновлюєм в БД, двома параметрами
                        {
                            _id: taskId,
                            owner: userId
                        },
                        { // 2 параметром передаєм редаговане оголошення
                            title,
                            body
                        },
                        { new: true } // після оновлення це буде нове оголошення
                    );

                    console.log(task);

                    if (!task) { // якщо немає такого оголошення 
                        res.json({
                            ok: false,
                            error: "Оголошення не твоє!"
                        });
                    } else {
                        res.json({
                            ok: true
                        });
                    }
                } else {
                    const task = await models.Task.create({
                        title,
                        body,
                        owner: userId
                    });
                    res.json({
                        ok: true,
                        task
                    });
                }
            } catch (error) {
                res.json({
                    ok: false
                });
            }
        }
    }
});

// DELETE TASK
router.post("/delete", async (req, res, next) => {
    const taskId = req.body.taskId;

    try {
        if (!taskId) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            await models.Task.findByIdAndDelete({
                _id: taskId
            });
            res.json({
                ok: true
            });
        }
    } catch (error) {
        throw new Error("Server Error");
    }
});

// SHARE TASK 
router.post("/share", async (req, res, next) => {
    const taskId = req.body.taskId;
    const userId = req.body.userId;

    console.log(taskId);
    console.log(userId);

    try {
        if (!taskId) {
            const err = new Error('Not Found');
            err.status = 404;
            next(err);
        } else {
            const task = await models.Task.findById(taskId);
            console.log(task);

            const owner = task.owner;

            await owner.forEach(item => {
                console.log("Owner item:", item._id);

                if (userId === item._id) {
                    res.json({
                        ok: false
                    });
                }
            });
            if (userId !== owner._id) {
                owner.push(userId);
                task.save();

                res.json({
                    ok: true
                });
            }

        }
    } catch (error) {
        throw new Error("Server Error");
    }

});

module.exports = router;