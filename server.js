// Create express app
var express = require("express")
var app = express()
var db = require("./database.js")
var md5 = require("md5")

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Server port
var HTTP_PORT = 8000 
// Start server
app.listen(HTTP_PORT, () => {
    console.log("Server running on port %PORT%".replace("%PORT%",HTTP_PORT))
});
// Root endpoint
app.get("/", (req, res, next) => {
    res.json({"message":"Ok"})
});

// Insert here other API endpoints

// Get a list of users
app.get("/api/users",(req,res,next) => {
    var sql = "select * from User"
    var params = []
    db.all(sql,params,(err,rows) => {
        if (err){
            res.status(400).json({"error":err.message});
            return;
        }
        res.json({
            "message" : "success",
            "data":rows
        })
    });
});

// Get a single user info(row) by userId
app.get("/api/user/:userID", (req, res, next) => {
    var sql = "select * from user where userID = ?"
    var params = [req.params.userID]
    db.get(sql, params, (err, row) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":row
        })
      });
});

// POST Insert a user
app.post("/api/user/", (req, res, next) => {
    var errors=[]

    if (!req.body.userID){
        errors.push("No userId specified");
    }
    if (!req.body.firstName){
        errors.push("No firstName specified");
    }
    if (!req.body.lastName){
        errors.push("No lastName specified");
    }
    if (!req.body.email){
        errors.push("No email specified");
    }
    if (!req.body.role){
        errors.push("No role specified");
    }
    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
    }
    var data = {
        userID: req.body.userID,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        role: req.body.role,
    }

    var sql = 'INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)'
    var params =[data.userID, data.firstName, data.lastName, data.email, data.role]
    db.run(sql, params, function (err, result) {
        if (err){
            res.status(400).json({"error": err.message})
            return;
        }
        res.json({
            "message": "success",
            "data": data,   
        })
    });
})


// Default response for any other request
app.use(function(req, res){
    res.status(404);
});
