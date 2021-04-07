import { Database } from 'sqlite3';

const dbUtil = (db: Database): void => {
  db.serialize(function () {
    console.log('Creating tables...');

    db.run(
      `CREATE TABLE IF NOT EXISTS "User" (
            "userID"	INTEGER NOT NULL,
            "firstName"	TEXT NOT NULL,
            "lastName"	TEXT NOT NULL,
            "email"	TEXT NOT NULL,
            "role"	TEXT NOT NULL,
            PRIMARY KEY("userID"),
            UNIQUE("email","userID")
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "CourseCoordinator" (
            "userID"	INTEGER NOT NULL,
            "courseCoordinatorAccess"	TEXT NOT NULL,
            PRIMARY KEY("userID"),
            FOREIGN KEY("userID") REFERENCES "User"("userID")
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "Marker" (
            "userID"	INTEGER NOT NULL,
            "markerAccess"	TEXT NOT NULL,
            FOREIGN KEY("userID") REFERENCES "User"("userID"),
            PRIMARY KEY("userID")
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "MarkerCoordinator" (
            "userID"	INTEGER NOT NULL,
            "markerCoordinatorAccess"	TEXT NOT NULL,
            PRIMARY KEY("userID"),
            FOREIGN KEY("userID") REFERENCES "User"("userID")
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "Applicant" (
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
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "Course" (
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
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "Application" (
            "applicationID"	INTEGER NOT NULL UNIQUE,
            "applicantID"	INTEGER NOT NULL UNIQUE,
            "courseID"	INTEGER NOT NULL UNIQUE,
            "CV"	BLOB,
            "relevantExperience"	TEXT,
            FOREIGN KEY("applicantID") REFERENCES "Applicant"("userID"),
            FOREIGN KEY("courseID") REFERENCES "Course"("courseID"),
            PRIMARY KEY("applicationID")
          );`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS "MarkerAssignment" (
            "markerID"	INTEGER NOT NULL,
            "courseID"	INTEGER NOT NULL,
            "year"	INTEGER NOT NULL,
            "semester"	INTEGER NOT NULL,
            "suitableForCourse"	TEXT,
            FOREIGN KEY("courseID") REFERENCES "Course"("courseID"),
            FOREIGN KEY("markerID") REFERENCES "Marker"("userID"),
            PRIMARY KEY("markerID","courseID")
          );`,
      (err: Error) => {
        if (err) {
          // Table already created
          return console.log(err.message);
        }
      }
    );

    console.log('Inserting data...');

    // Create user data
    const userInsert =
      'INSERT OR IGNORE INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)';
    const users = [
      [1, 'Burkhard', 'Wuensche', 'burkhard@aucklanduni.ac.nz', 'MarkerCoordinator'],
      [2, 'Asma', 'Shakil', 'asma@aucklanduni.ac.nz', 'CourseCoordinator'],
      [3, 'Songyan', 'Teng', 'songyan@aucklanduni.ac.nz', 'Applicant'],
      [4, 'Darren', 'Chen', 'darren@aucklanduni.ac.nz', 'Marker'],
      [5, 'Jim', 'Park', 'jim@aucklanduni.ac.nz', 'Marker'],
    ];

    users.forEach((user) => db.run(userInsert, user));

    // Create applicant data
    const applicantInsert =
      'INSERT OR IGNORE INTO Applicant (userID, degree, year, isEnrolled, GPA, hasVisa, inAuckland, academicRecord, applicantAccess) VALUES (?,?,?,?,?,?,?,?,?)';
    const applicants = [[3, 'Science', 3, 'Yes', 5.0, 'Yes', 'Yes', '', 'Applicant Access']];

    applicants.forEach((applicant) => db.run(applicantInsert, applicant));

    // Create marker data
    const markerInsert = 'INSERT OR IGNORE INTO Marker (userID, markerAccess) VALUES (?,?)';
    const markers = [
      [4, 'Marker Access'],
      [5, 'Marker Access'],
    ];

    markers.forEach((marker) => db.run(markerInsert, marker));

    // Create marker coordinator data
    const markerCoordinatorInsert =
      'INSERT OR IGNORE INTO MarkerCoordinator (userID, markerCoordinatorAccess) VALUES (?,?)';
    const markerCoordinators = [[1, 'Marker Coordinator Access']];

    markerCoordinators.forEach((markerCoordinator) =>
      db.run(markerCoordinatorInsert, markerCoordinator)
    );

    // Create course coordinator data
    const courseCoordinatorInsert =
      'INSERT OR IGNORE INTO CourseCoordinator (userID, courseCoordinatorAccess) VALUES (?,?)';
    const courseCoordinators = [[2, 'Course Coordinator Access']];

    courseCoordinators.forEach((courseCoordinator) =>
      db.run(courseCoordinatorInsert, courseCoordinator)
    );

    // Create course data
    const courseInsert =
      'INSERT OR IGNORE INTO Course (courseID, courseName, enrolmentEstimate, enrolmentFinal, workload, coordinatorID, courseInfoDeadline, applicationDeadline, markerPrefDeadline, markerAssignmentDeadline, otherTasks) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
    const courses = [
      [
        1,
        'COMPSCI 399',
        50,
        100,
        50,
        2,
        '01/01/2021',
        '01/01/2021',
        '01/01/2021',
        '01/01/2021',
        'Give good grades!',
      ],
      [2, 'COMPSCI 101', 300, 500, 80, 2, '', '', '', '', ''],
    ];

    courses.forEach((course) => db.run(courseInsert, course));

    // Create application data
    const applicationInsert =
      'INSERT OR IGNORE INTO Application (applicationID, applicantID, courseID, CV, relevantExperience) VALUES (?,?,?,?,?)';
    const applications = [[1, 3, 2, '', "I've taught stuff"]];

    applications.forEach((application) => db.run(applicationInsert, application));

    // Create marker assignment data
    const markerAssignmentInsert =
      'INSERT OR IGNORE INTO MarkerAssignment (markerID, courseID, year, semester, suitableForCourse) VALUES (?,?,?,?,?)';
    const markerAssignments = [
      [4, 1, 2021, 1, 'Yes'],
      [5, 2, 2021, 2, 'No'],
    ];

    markerAssignments.forEach((markerAssignment) =>
      db.run(markerAssignmentInsert, markerAssignment)
    );

    db.close();

    console.log('Done!');
  });
};

export default dbUtil;
