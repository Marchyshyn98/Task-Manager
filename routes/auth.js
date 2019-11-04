const express = require("express");
const router = express.Router();
const models = require("../models");
const bcrypt = require("bcrypt-nodejs");

// Реєстрація
router.post("/register", (req, res) => {
    const login = req.body.login;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;

    if (!login || !password || !passwordConfirm) {
        const fields = [];
        if (!login) fields.push('login');
        if (!password) fields.push('password');
        if (!passwordConfirm) fields.push('passwordConfirm');
        res.json({
            ok: false,
            error: "Всі поля повинні бути заповненими",
            fields
        });
    } else if (!/^[a-zA-Z0-9]+$/.test(login)) { // регулярне вираження для тесту 
        res.json({
            ok: false,
            error: "Недопустимий символ",
            fields: ['login']
        });
    } else if (login.length < 3 || login.length > 16) {
        res.json({
            ok: false,
            error: "Довжина логіну не менше 3 символів",
            fields: ['login']
        });
    } else if (password !== passwordConfirm) {
        res.json({
            ok: false,
            error: "Паролі не співпадають",
            fields: ['password']
        });
    } else if (password.length < 5) {
        res.json({
            ok: false,
            error: "Довжина паролю не менше 5 символів",
            fields: ['password']
        });
    } else {
        models.User.findOne({ // Перевірка чи є вже такий юзер з логіном в бд....шукаємо юзера з конкретним логіном....
            login
        }).then(user => {
            if (!user) {
                bcrypt.hash(password, null, null, (err, hash) => {
                    models.User.create({
                        login,
                        password: hash
                    }).then(user => {
                        console.log(user);
                        req.session.userId = user.id; // звертаємось до сесії, щоб при реєстрації відбувалась відразу авторизація
                        req.session.userLogin = user.login;
                        res.json({
                            ok: true
                        });
                    }).catch({
                        ok: false,
                        error: "Помилка з'єднання, спробуйте пізніше"
                    });
                });
            } else {
                res.json({
                    ok: false,
                    error: "Ім'я зайнято!",
                    fields: ["login"]
                });
            }
        });
    }
});

// Авторизація
router.post("/login", (req, res) => {
    const login = req.body.login;
    const password = req.body.password;

    if (!login || !password) {
        const fields = [];
        if (!login) fields.push('login');
        if (!password) fields.push('password');
        res.json({
            ok: false,
            error: "Всі поля повинні бути заповненими",
            fields
        });
    } else {
        models.User.findOne({
            login
        }).then(user => {
            if (!user) {
                res.json({
                    ok: false,
                    error: "Логін і пароль неправильні",
                    fields: ['login', 'password']
                });
            } else {
                bcrypt.compare(password, user.password, function (err, result) { // порівнюємо пароль з бд для авторизації....1 параметр-пароль при вході, 2 параметр-пароль який є в бд
                    if (!result) {
                        res.json({
                            ok: false,
                            error: "Логін і пароль неправильні",
                            fields: ['login', 'password']
                        });
                    } else { // тоді все ок і йде авторизація
                        req.session.userId = user.id; // звертаємось до сесії, створюємо в ній поле userID в об'єкті сесії і зберігаємо туди id юзера
                        req.session.userLogin = user.login;
                        res.json({
                            ok: true
                        }); // після цього в браузер має зберегтись cookie по якому це все буде оприділятись
                    }
                });
            }
        })
            .catch(err => {
                console.log(err);
                res.json({
                    ok: false,
                    error: "Помилка, попробуйте пізніше"
                });
            });
    }
});

router.get("/logout", (req, res) => {
    if (req.session) { // якщо є сесія
        // delete session object
        req.session.destroy(() => { // то завершуємо сесію...очищуємо дані сеансу
            res.redirect("/"); // переходимо наголовну
        });
    } else {
        res.redirect("/");
    }
});

module.exports = router;
