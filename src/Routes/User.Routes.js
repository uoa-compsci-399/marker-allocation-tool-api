const express = require("express");
const db = require("../db/database");

const router = express.Router();

// Get a list of users
router.get("/users", (req, res, next) => {
  let sql = "select * from User";
  let params = [];
  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// Get a single user info(row) by userId
router.get("/user/:userID", (req, res, next) => {
  let sql = "select * from user where userID = ?";
  let params = [req.params.userID];
  db.get(sql, params, (err, row) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: row,
    });
  });
});

// POST Insert a user
router.post("/user/", (req, res, next) => {
  let errors = [];

  if (!req.body.userID) {
    errors.push("No userId specified");
  }
  if (!req.body.firstName) {
    errors.push("No firstName specified");
  }
  if (!req.body.lastName) {
    errors.push("No lastName specified");
  }
  if (!req.body.email) {
    errors.push("No email specified");
  }
  if (!req.body.role) {
    errors.push("No role specified");
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(",") });
    return;
  }
  let data = {
    userID: req.body.userID,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
  };

  let sql =
    "INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)";
  let params = [
    data.userID,
    data.firstName,
    data.lastName,
    data.email,
    data.role,
  ];
  db.run(sql, params, function (err, result) {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: data,
    });
  });
});

module.exports = router;
