import { Database as SQLite3Database } from 'sqlite3';

export default class DBDataUtil {
  private static createTable(db: SQLite3Database, name: string, cols: string[]): void {
    const sqlCols = cols.join(', ');
    const sqlCmd = `CREATE TABLE IF NOT EXISTS "${name}" (${sqlCols});`;
    db.run(sqlCmd, (err: Error) => {
      if (err == null) return;
      console.error(err);
    });
  }

  static createTables(db: SQLite3Database): void {
    db.serialize(() => {
      this.createTable(db, 'Course', [
        '"courseID"	INTEGER PRIMARY KEY',
        '"courseName"	TEXT NOT NULL',
        '"year"	INTEGER NOT NULL',
        '"whichSemestersField"	INTEGER NOT NULL',
        '"isPublished"	INTEGER NOT NULL',
        '"enrolmentEstimate"	INTEGER NOT NULL',
        '"enrolmentFinal"	INTEGER NOT NULL',
        '"workload"	INTEGER NOT NULL',
        '"courseInfoDeadline"	TEXT',
        '"applicationDeadline"	TEXT',
        '"markerPrefDeadline"	TEXT',
        '"markerAssignmentDeadline"	TEXT',
        '"otherTasks"	TEXT',
      ]);

      this.createTable(db, 'Application', [
        '"applicationID"	INTEGER PRIMARY KEY',
        '"markerID"	INTEGER NOT NULL REFERENCES "Marker"("userID")',
        '"year"	INTEGER NOT NULL',
        '"whichSemestersField"	INTEGER NOT NULL',
        '"curriculumVitae"	BLOB NOT NULL',
        '"academicRecord"	BLOB NOT NULL',
        '"hoursRequested"	INTEGER NOT NULL',
        '"relevantExperience"	TEXT',
      ]);

      this.createTable(db, 'ApplicationCourse', [
        '"applicationCourseID"	INTEGER PRIMARY KEY',
        '"applicationID"	INTEGER NOT NULL REFERENCES "Application"("applicationID")',
        '"courseID"	INTEGER NOT NULL REFERENCES "Course"("courseID")',
        '"status"	INTEGER NOT NULL',
        '"hoursAllocated"	INTEGER',
        '"claimGradeAchieved"	TEXT',
      ]);

      this.createTable(db, 'User', [
        '"userID"	INTEGER PRIMARY KEY',
        '"firstName"	TEXT NOT NULL',
        '"lastName"	TEXT NOT NULL',
        '"email"	TEXT NOT NULL',
        '"role"	TEXT NOT NULL',
      ]);

      this.createTable(db, 'MarkerCoordinator', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"markerCoordinatorAccess"	TEXT NOT NULL',
      ]);

      this.createTable(db, 'CourseCoordinator', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"courseCoordinatorAccess"	TEXT NOT NULL',
      ]);

      this.createTable(db, 'Marker', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"markerAccess"	TEXT NOT NULL',
        '"upi" TEXT NOT NULL',
        '"studentID" TEXT NOT NULL',
        '"dateOfBirth"	TEXT NOT NULL',
        '"phoneNumber"	TEXT',
        '"isScholarshipRecipient"	INTEGER NOT NULL',
        '"isNZCitizenOrPermanentResident"	INTEGER NOT NULL',
        '"hasWorkVisa"	INTEGER NOT NULL',
        '"isInAuckland"	INTEGER NOT NULL',
        '"lastApplicationID"	INTEGER REFERENCES "Application"("applicationID")',
      ]);
    });
  }

  static populateTables(db: SQLite3Database): void {
    db.serialize(() => {
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
    });
  }

  static initialize(db: SQLite3Database): void {
    console.log('Creating tables...');
    this.createTables(db);

    console.log('Inserting data...');
    this.populateTables(db);

    console.log('Done!');
  }
}
