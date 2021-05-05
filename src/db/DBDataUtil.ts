import * as sqlite3 from 'sqlite3';
import SQLiteUtil from './SQLiteUtil';

export default class DBDataUtil {
  static createTables(db: sqlite3.Database): void {
    db.serialize(() => {
      SQLiteUtil.createTable(db, 'Course', [
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

      SQLiteUtil.createTable(db, 'Application', [
        '"applicationID"	INTEGER PRIMARY KEY',
        '"markerID"	INTEGER NOT NULL REFERENCES "Marker"("userID")',
        '"year"	INTEGER NOT NULL',
        '"availability"	INTEGER NOT NULL',
        '"curriculumVitae"	BLOB NOT NULL',
        '"academicRecord"	BLOB NOT NULL',
        //'"hoursRequested"	INTEGER NOT NULL',
        //'"relevantExperience"	TEXT',
        '"areaOfStudy"	TEXT NOT NULL',
        '"enrolmentStatus"	TEXT NOT NULL',
        '"workEligible"	INTEGER NOT NULL',
        '"inAuckland"	INTEGER NOT NULL',
        '"declaration"	INTEGER NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'ApplicationCourse', [
        '"applicationCourseID"	INTEGER PRIMARY KEY',
        '"applicationID"	INTEGER NOT NULL REFERENCES "Application"("applicationID")',
        '"courseID"	INTEGER NOT NULL REFERENCES "Course"("courseID")',
        '"status"	INTEGER NOT NULL',
        '"hoursAllocated"	INTEGER',
        // '"claimGradeAchieved"	TEXT',
      ]);

      SQLiteUtil.createTable(db, 'User', [
        '"userID"	INTEGER PRIMARY KEY',
        '"firstName"	TEXT NOT NULL',
        '"lastName"	TEXT NOT NULL',
        '"email"	TEXT NOT NULL',
        '"upi"	TEXT NOT NULL',
        '"role"	TEXT NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'UserToken', [
        '"userTokenID"	INTEGER PRIMARY KEY',
        '"userID"	INTEGER NOT NULL REFERENCES "User"("userID")',
        '"createdAt"	TEXT NOT NULL',
        '"value"	TEXT NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'MarkerCoordinator', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"markerCoordinatorAccess"	TEXT NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'CourseCoordinator', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"courseCoordinatorAccess"	TEXT NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'CourseCoordinatorCourse', [
        '"courseCoordinatorCourseID"	INTEGER PRIMARY KEY',
        '"courseCoordinatorID"	INTEGER REFERENCES "CourseCoordinator"("userID")',
        '"courseID"	INTEGER REFERENCES "Course"("courseID")',
        '"permissions"	INTEGER NOT NULL',
      ]);

      SQLiteUtil.createTable(db, 'Marker', [
        '"userID"	INTEGER PRIMARY KEY REFERENCES "User"("userID")',
        //'"markerAccess"	TEXT NOT NULL',
        //'"upi" TEXT NOT NULL',
        '"studentID" TEXT NOT NULL',
        '"dateOfBirth"	TEXT NOT NULL',
        //'"phoneNumber"	TEXT',
        //'"isScholarshipRecipient"	INTEGER NOT NULL',
        //'"isNZCitizenOrPermanentResident"	INTEGER NOT NULL',
        //'"hasWorkVisa"	INTEGER NOT NULL',
        //'"isInAuckland"	INTEGER NOT NULL',
        '"lastApplicationID"	INTEGER REFERENCES "Application"("applicationID")',
      ]);
    });
  }

  static populateTables(db: sqlite3.Database): void {
    db.serialize(() => {
      // Create user data
      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'User', {
        userID: [1, 2, 3, 4, 5],
        firstName: ['Burkhard', 'Asma', 'Songyan', 'Darren', 'Jim'],
        lastName: ['Wuensche', 'Shakil', 'Teng', 'Chen', 'Park'],
        email: ['burkhard', 'asma', 'songyan', 'darren', 'jim'].map(
          (fn) => `${fn}@aucklanduni.ac.nz`
        ),
        upi: ['bwen001', 'asha001', 'sten001', 'cche001', 'jpar001'],
        role: ['MarkerCoordinator', 'CourseCoordinator', 'Marker', 'Marker', 'Marker'],
      });

      // Create marker data
      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'Marker', {
        userID: [3, 4, 5],
        //upi: ['sten187', 'cche795', 'jpar914'],
        studentID: ['883789472', '809097908', '5615303'],
        dateOfBirth: ['2000-01-01', '2000-02-02', '2000-03-03'],
        //phoneNumber: ['0800 83 83 83', '022987456', null],
        //isScholarshipRecipient: [0, 0, 1],
        //isNZCitizenOrPermanentResident: [1, 0, 0],
        //hasWorkVisa: [0, 0, 1],
        //isInAuckland: [1, 1, 1],
        //lastApplicationID: [null, null, null],
      });

      // Create marker coordinator data
      SQLiteUtil.insertIntoTableAsObject(db, true, 'MarkerCoordinator', {
        userID: 1,
      });

      // Create course coordinator data
      SQLiteUtil.insertIntoTableAsObject(db, true, 'CourseCoordinator', {
        userID: 2,
      });

      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'CourseCoordinatorCourse', {
        courseCoordinatorCourseID: [1, 2],
        courseCoordinatorID: [2, 2],
        courseID: [1, 2],
        permissions: [0b111, 0b111],
      });

      // Create course data
      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'Course', {
        courseID: [1, 2, 3],
        courseName: ['COMPSCI 399', 'COMPSCI 101', 'COMPSCI 130'],
        year: [2021, 2021, 2021],
        whichSemestersField: [0b010, 0b010, 0b100],
        isPublished: [1, 1, 1],
        enrolmentEstimate: [50, 300, 300],
        enrolmentFinal: [100, 500, 0],
        workload: [50, 80, 80],
        courseInfoDeadline: ['2021-01-01', '2021-01-01', '2021-03-01'],
        applicationDeadline: ['2021-01-01', '2022-01-01', '2021-07-01'],
        markerPrefDeadline: ['2021-01-01', '2021-01-01', '2021-07-10'],
        markerAssignmentDeadline: ['2021-01-01', '2021-01-01', '2021-07-20'],
        otherTasks: ['Give good grades!', '', ''],
      });

      // Create application data
      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'Application', {
        applicationID: [1],
        markerID: [3],
        year: [2021],
        availability: [0b010],
        curriculumVitae: [Buffer.from('%PDF-1.7\r\n')],
        academicRecord: [Buffer.from('%PDF-1.7\r\n')],
        //hoursRequested: [50],
        //relevantExperience: ["I've taught stuff"],
        areaOfStudy: ['Science'],
        enrolmentStatus: ['enrolled'],
        workEligible: [1],
        inAuckland: [1],
        declaration: [1],
      });

      SQLiteUtil.insertMultipleIntoTableAsArrayObject(db, true, 'ApplicationCourse', {
        applicationCourseID: [1],
        applicationID: [1],
        courseID: [2],
        status: [0],
        hoursAllocated: [0],
        // claimGradeAchieved: ['A+'],
      });
    });
  }

  static initialize(db: sqlite3.Database): void {
    console.log('Creating tables...');
    this.createTables(db);

    console.log('Inserting data...');
    this.populateTables(db);

    console.log('Done!');
  }
}
