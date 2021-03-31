// Create express app
const express = require("express");
const app = express();
const md5 = require("md5");
const bodyParser = require("body-parser");

const userRoute = require("./Routes/User.Routes");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res, next) => {
  res.json({ message: "Ok" });
});

app.use("/api/", userRoute);

// Insert here other API endpoints

// Default response for any other request
app.use(function (req, res) {
  res.status(404);
});

module.exports = app;
