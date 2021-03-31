var sqlite3 = require('sqlite3').verbose()
var md5 = require('md5')

const DBSOURCE = "db.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(
        // Create the database
        `CREATE TABLE "User" (
            "userID"	INTEGER NOT NULL,
            "firstName"	TEXT NOT NULL,
            "lastName"	TEXT NOT NULL,
            "email"	TEXT NOT NULL,
            "role"	TEXT NOT NULL,
            PRIMARY KEY("userID"),
            UNIQUE("email","userID")
        );
            
        CREATE TABLE "Marker Coordinator" (
            "userID"	INTEGER NOT NULL,
            "markerAccess"	TEXT NOT NULL,
            FOREIGN KEY("userID") REFERENCES "User"("userID"),
            PRIMARY KEY("userID")
        );

        CREATE TABLE "Course Coordinator" (
            "userID"	INTEGER NOT NULL,
            "coordinatorAccess"	TEXT NOT NULL,
            FOREIGN KEY("userID") REFERENCES "User"("userID"),
            PRIMARY KEY("userID")
        );

        CREATE TABLE "Course" (
            "CourseID"	INTEGER NOT NULL UNIQUE,
            "enrolmentEstimate"	INTEGER NOT NULL,
            "enrolmentFinal"	INTEGER NOT NULL,
            "workload"	INTEGER NOT NULL,
            "coordinatorID"	INTEGER NOT NULL UNIQUE,
            FOREIGN KEY("coordinatorID") REFERENCES "Course Coordinator"("userID"),
            PRIMARY KEY("CourseID")
        );

        CREATE TABLE "Application" (
            "applicationID"	INTEGER NOT NULL UNIQUE,
            "applicantID"	INTEGER NOT NULL UNIQUE,
            "courseID"	INTEGER NOT NULL UNIQUE,
            "CV"	BLOB,
            "relevantExperience"	INTEGER,
            FOREIGN KEY("courseID") REFERENCES "Course"("CourseID"),
            FOREIGN KEY("applicantID") REFERENCES "Applicant"("userID"),
            PRIMARY KEY("applicationID")
        );

        CREATE TABLE "Applicant" (
            "userID"	INTEGER NOT NULL,
            "applicantAccess"	INTEGER NOT NULL,
            "GPA"	INTEGER NOT NULL,
            "degree"	TEXT NOT NULL,
            "year"	INTEGER NOT NULL,
            "hasVisa"	INTEGER NOT NULL,
            "inAuckland"	INTEGER NOT NULL,
            "academicRecordID"	INTEGER NOT NULL UNIQUE,
            FOREIGN KEY("userID") REFERENCES "User"("userID"),
            FOREIGN KEY("academicRecordID") REFERENCES "AcademicRecord"("academicRecordID"),
            PRIMARY KEY("userID")
        );

        CREATE TABLE "AcademicRecord" (
            "academicRecordID"	INTEGER NOT NULL,
            "courses"	TEXT NOT NULL,
            "grades"	INTEGER NOT NULL,
            "pointsCompleted"	INTEGER NOT NULL,
            PRIMARY KEY("academicRecordID"),
            UNIQUE("academicRecordID")
        );`,

        (err) => {
            if (err) {
                // Table already created
            }else{
                // Table just created, creating some rows
                var insert = 'INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)'
                db.run(insert, ["123","darrem", "chen", "admin@example.com","admin"])
                db.run(insert, ["456","hery", "yun", "user@example.com","student"])
            }
        });  
    }
});


module.exports = db