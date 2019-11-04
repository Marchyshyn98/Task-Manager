const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const staticAsset = require("static-asset");
const routes = require("./routes");
const mongoose = require("mongoose");
const session = require('express-session'); // підключаємо модулі для сесій
const MongoStore = require('connect-mongo')(session);

const config = require('./config');

//database
mongoose.Promise = global.Promise;
mongoose.set("debug", config.IS_PRODUCTION); // режим отладки, а на сервері режим продакшн

mongoose.connection
    .on("error", error => console.log(error))
    .on("close", () => console.log("Database connection closed!"))
    .once("open", () => {
        const info = mongoose.connections[0];
        console.log(`Connected to ${info.host}:${info.port}/${info.name}`);
        //mocks();
    });

mongoose.connect(config.MONGO_URL);

//express
const app = express();

//session
app.use( // додає змінну через яку можна звертатися до сесій
    session({ //  підключаємо middleware
        secret: config.SESSION_SECRET, // потрібно для криптографії
        resave: true,
        saveUninitialized: false,
        store: new MongoStore({ // створює сесії в mongoDB
            mongooseConnection: mongoose.connection
        })
    })
);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "public"))); // відправляємо юзеру статичні файли
app.use("/js", express.static(path.join(__dirname, "node_modules", "jquery", "dist")));
app.use(staticAsset(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/api/auth", routes.auth);
app.use("/task", routes.task);
app.use("/", routes.list);

app.get("/", (req, res) => {
    res.render("index");
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler 
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.render('error', {
        message: error.message,
        error: !config.IS_PRODUCTION ? error : {},
        title: 'Oops...'
    });
});

app.listen(config.PORT, () => {
    console.log(`App listening on port ${config.PORT}!`);
});