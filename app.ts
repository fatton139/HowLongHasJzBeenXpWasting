import * as express from "express";
import * as path from "path";
import * as logger from "morgan";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import * as lessMiddleware from "less-middleware";
import * as dotenv from "dotenv";

import index from "./routes/index";

dotenv.config();

const app = express();

// middleware setup
app.use(lessMiddleware(__dirname + "/public"));
app.use(express.static(__dirname + "/public"));
app.use("/node_modules", express.static(__dirname + "/node_modules"));
app.use("/test", express.static(__dirname + "/public"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

if (process.env.NODE_ENV !== "test") {
    app.use(logger("dev"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// views setup
app.use("/", index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err: any = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

export default app;
