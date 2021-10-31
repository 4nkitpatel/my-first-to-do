const express = require("express");
const bodyParser = require("body-parser");

const path = require("path");

const listRouter = require("./routes/list");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.set("views", "views");

app.use(listRouter);


app.listen(3333);
