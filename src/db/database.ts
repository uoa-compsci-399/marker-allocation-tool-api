import * as sqlite from "sqlite3";

const sqlite3 = sqlite.verbose();
const DBSOURCE = "db.sqlite";

let db = new sqlite3.Database(DBSOURCE, (err: any) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.run(
      // Create the database
      `CREATE TABLE "Applicant" (
        "userID"	INTEGER NOT NULL,
        "degree"	TEXT NOT NULL,
        "year"	INTEGER NOT NULL,
        "isEnrolled"	TEXT NOT NULL,
        "GPA"	REAL NOT NULL,
        "hasVisa"	TEXT NOT NULL,
        "inAuckland"	TEXT NOT NULL,
        "academicRecord"	BLOB,
        "applicantAccess"	TEXT NOT NULL,
        FOREIGN KEY("userID") REFERENCES "User"("userID"),
        PRIMARY KEY("userID")
      );

      CREATE TABLE "Application" (
        "applicationID"	INTEGER NOT NULL UNIQUE,
        "applicantID"	INTEGER NOT NULL UNIQUE,
        "courseID"	INTEGER NOT NULL UNIQUE,
        "CV"	BLOB,
        "relevantExperience"	TEXT,
        FOREIGN KEY("applicantID") REFERENCES "Applicant"("userID"),
        FOREIGN KEY("courseID") REFERENCES "Course"("courseID"),
        PRIMARY KEY("applicationID")
      );

      CREATE TABLE "Course" (
        "courseID"	INTEGER NOT NULL UNIQUE,
        "courseName"	TEXT NOT NULL,
        "enrolmentEstimate"	INTEGER NOT NULL,
        "enrolmentFinal"	INTEGER NOT NULL,
        "workload"	INTEGER NOT NULL,
        "coordinatorID"	INTEGER NOT NULL,
        "courseInfoDeadline"	TEXT,
        "applicationDeadline"	TEXT,
        "markerPrefDeadline"	TEXT,
        "markerAssignmentDeadline"	TEXT,
        "otherTasks"	TEXT,
        FOREIGN KEY("coordinatorID") REFERENCES "CourseCoordinator"("userID"),
        PRIMARY KEY("courseID")
      );

      CREATE TABLE "CourseCoordinator" (
        "userID"	INTEGER NOT NULL,
        "courseCoordinatorAccess"	TEXT NOT NULL,
        PRIMARY KEY("userID"),
        FOREIGN KEY("userID") REFERENCES "User"("userID")
      );

      CREATE TABLE "Marker" (
        "userID"	INTEGER NOT NULL,
        "markerAccess"	TEXT NOT NULL,
        FOREIGN KEY("userID") REFERENCES "User"("userID"),
        PRIMARY KEY("userID")
      );

      CREATE TABLE "MarkerAssignment" (
        "markerID"	INTEGER NOT NULL,
        "courseID"	INTEGER NOT NULL,
        "year"	INTEGER NOT NULL,
        "semester"	INTEGER NOT NULL,
        "suitableForCourse"	TEXT,
        FOREIGN KEY("courseID") REFERENCES "Course"("courseID"),
        FOREIGN KEY("markerID") REFERENCES "Marker"("userID"),
        PRIMARY KEY("markerID","courseID")
      );

      CREATE TABLE "MarkerCoordinator" (
        "userID"	INTEGER NOT NULL,
        "markerCoordinatorAccess"	TEXT NOT NULL,
        PRIMARY KEY("userID"),
        FOREIGN KEY("userID") REFERENCES "User"("userID")
      );

      CREATE TABLE "User" (
        "userID"	INTEGER NOT NULL,
        "firstName"	TEXT NOT NULL,
        "lastName"	TEXT NOT NULL,
        "email"	TEXT NOT NULL,
        "role"	TEXT NOT NULL,
        PRIMARY KEY("userID"),
        UNIQUE("email","userID")
      );`,

      (err: any) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        } else {
          // Create user data
          let userInsert = "INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)";
          let users = [
            [1, "Burkhard", "Wuensche", "burkhard@aucklanduni.ac.nz", "MarkerCoordinator"], 
            [2, "Asma", "Shakil", "asma@aucklanduni.ac.nz", "CourseCoordinator"],
            [3, "Songyan", "Teng", "songyan@aucklanduni.ac.nz", "Applicant"],
            [4, "Darren", "Chen", "darren@aucklanduni.ac.nz", "Marker"],
            [5, "Jim", "Park", "jim@aucklanduni.ac.nz", "Marker"]
          ];
          
          for (let i = 0; i < users.length; i++) {
            db.run(userInsert, users[i]);
          }

          // Create applicant data
          let applicantInsert = "INSERT INTO Applicant (userID, degree, year, isEnrolled, GPA, hasVisa, inAuckland, academicRecord, applicantAccess) VALUES (?,?,?,?,?,?,?,?,?)";
          let applicants = [
            [3, "Science", 3, "Yes", 5.0, "Yes", "Yes", , "Applicant Access"]
          ];

          for (let i = 0; i < applicants.length; i++) {
            db.run(applicantInsert, applicants[i]);
          }

          // Create marker data
          let markerInsert = "INSERT INTO Marker (userID, markerAccess) VALUES (?,?)";
          let markers = [
            [4, "Marker Access"],
            [5, "Marker Access"] 
          ];

          for (let i = 0; i < markers.length; i++) {
            db.run(markerInsert, markers[i]);
          }

          // Create marker coordinator data
          let markerCoordinatorInsert = "INSERT INTO MarkerCoordinator (userID, markerCoordinatorAccess) VALUES (?,?)";
          let markerCoordinators = [
            [1, "Marker Coordinator Access"],
          ];

          for (let i = 0; i < markerCoordinators.length; i++) {
            db.run(markerCoordinatorInsert, markerCoordinators[i]);
          }

          // Create course coordinator data
          let courseCoordinatorInsert = "INSERT INTO MarkerCoordinator (userID, markerCoordinatorAccess) VALUES (?,?)";
          let courseCoordinators = [
            [2, "Course Coordinator Access"],
          ];

          for (let i = 0; i < courseCoordinators.length; i++) {
            db.run(courseCoordinatorInsert, courseCoordinators[i]);
          }

          // Create course data
          let courseInsert = "INSERT INTO Course (courseID, courseName, enrolmentEstimate, enrolmentFinal, workload, coordinatorID, courseInfoDeadline, applicationDeadline, markerPrefDeadline, markerAssignmentDeadline, otherTasks) VALUES (?,?,?,?,?,?,?,?,?,?,?)";
          let courses = [
            [1, "COMPSCI 399", 50, 100, 50, 2, "01/01/2021", "01/01/2021", "01/01/2021", "01/01/2021", "Give good grades!"], 
            [2, "COMPSCI 101", 300, 500, 80, 2, "01/01/2022", "01/01/2022", "01/01/2022", "01/01/2022", "Give good grades!"],
          ];
          
          for (let i = 0; i < courses.length; i++) {
            db.run(courseInsert, courses[i]);
          }

          // Create application data
          let applicationInsert = "INSERT INTO Application (applicationID, applicantID, courseID, CV, relevantExperience) VALUES (?,?,?,?,?)";
          let applications = [
            [1, 3, 2, , "I've taught stuff"] 
          ];
          
          for (let i = 0; i < applications.length; i++) {
            db.run(applicationInsert, applications[i]);
          }

          // Create marker assignment data
          let markerAssignmentInsert = "INSERT INTO MarkerAssignment (markerID, courseID, year, semester, suitableForCourse) VALUES (?,?,?,?,?)";
          let markerAssignments = [
            [4, 1, 2021, 1, "Yes"], 
            [5, 2, 2021, 2, "No"]
          ];
          
          for (let i = 0; i < markerAssignments.length; i++) {
            db.run(markerAssignmentInsert, markerAssignments[i]);
          }
        }
      }
    );
  }
});

export default db;
