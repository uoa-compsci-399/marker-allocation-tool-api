import express, { Request, Response } from 'express';
// import { sqlite3 } from 'sqlite3';
import db from '../db/DBController';
import {
  RequestBody,
  UserRequest,
  ApplicationRequest,
  CourseRequest,
  CourseID,
} from '../utils/RequestBody';

const router = express.Router();

// Gets list of all values from table
const getAllData = (req: Request, res: Response, table: string) => {
  const sql = 'SELECT * FROM ' + table;
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
};

// Get a single row by id
const getSingleRow = (req: Request, res: Response, table: string, id: string) => {
  const sql = 'SELECT * FROM ' + table + ' WHERE ' + id + ' = ?';
  const reqString = 'req.params.' + id;
  const params = [eval(reqString)];

  db.get(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
};

// Get a list of users
router.get('/users', (req: Request, res: Response) => {
  getAllData(req, res, 'User');
});

// Get a list of applications
router.get('/applications', (req: Request, res: Response) => {
  getAllData(req, res, 'Application');
});

// Get a list of courses
router.get('/courses', (req: Request, res: Response) => {
  getAllData(req, res, 'Course');
});

// Get a list of available/open courses
router.get('/courses/available', (req: Request, res: Response) => {
  const sql = "SELECT * FROM Course WHERE DATE('now') <= DATE(applicationDeadline)";
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a single user row by userID
router.get('/user/:userID', (req: Request, res: Response) => {
  getSingleRow(req, res, 'User', 'userID');
});

// Get a single application row by applicationID
router.get('/application/:applicationID', (req: Request, res: Response) => {
  getSingleRow(req, res, 'Application', 'applicationID');
});

// Get a single course row by courseID
router.get('/course/:courseID', (req: Request, res: Response) => {
  getSingleRow(req, res, 'Course', 'courseID');
});

// POST Insert a user
router.post('/user/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as UserRequest;

  if (!data.userID) {
    errors.push('No userID specified');
  }
  if (!data.firstName) {
    errors.push('No firstName specified');
  }
  if (!data.lastName) {
    errors.push('No lastName specified');
  }
  if (!data.email) {
    errors.push('No email specified');
  }
  if (!data.role) {
    errors.push('No role specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql = 'INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)';
  const params = [data.userID, data.firstName, data.lastName, data.email, data.role];

  db.run(sql, params).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// POST Insert a application
router.post('/application/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as ApplicationRequest;

  if (!data.applicationID) {
    errors.push('No applicationID specified');
  }
  if (!data.markerID) {
    errors.push('No markerID specified');
  }
  if (!data.year) {
    errors.push('No year specified');
  }
  if (!data.whichSemestersField) {
    errors.push('No whichSemestersField specified');
  }
  if (!data.appliedCourses) {
    errors.push('No appliedCourses specified');
  }
  if (!data.curriculumVitae) {
    errors.push('No curriculumVitae specified');
  }
  if (!data.academicRecord) {
    errors.push('No academicRecord specified');
  }
  if (!data.hoursRequested) {
    errors.push('No hoursRequested specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql =
    'INSERT INTO Application (applicationID, markerID, year, whichSemestersField, appliedCourses, curriculumVitae, academicRecord, hoursRequested, relevantExperience) VALUES (?,?,?,?,?,?,?,?,?)';
  const params = [
    data.applicationID,
    data.markerID,
    data.year,
    data.whichSemestersField,
    data.appliedCourses,
    data.curriculumVitae,
    data.academicRecord,
    data.hoursRequested,
    data.relevantExperience ? data.relevantExperience : '',
  ];

  db.run(sql, params).then(
    () => {
      //responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );

  const appliedCourseList = data.appliedCourses.split(',');

  appliedCourseList.forEach((course) => {
    const getCourseID = 'SELECT courseID FROM Course WHERE courseName = ?';

    db.get(getCourseID, [course]).then(
      (value: CourseID) => {
        const query =
          'INSERT INTO ApplicationCourse (applicationID, courseID, status, hoursAllocated) VALUES (?,?,?,?)';
        const param = [data.applicationID, value.courseID, '0', '0'];
        db.run(query, param).then(
          () => {
            responseOk(res, data);
          },
          (reason: Error) => {
            badRequest(res, reason.message + '----');
          }
        );
      },
      (reason: Error) => {
        badRequest(res, reason.message);
      }
    );
  });
});

// POST Insert a course
router.post('/course/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as CourseRequest;

  if (!data.courseID) {
    errors.push('No courseID specified');
  }
  if (!data.courseName) {
    errors.push('No courseName specified');
  }
  if (!data.year) {
    errors.push('No year specified');
  }
  if (!data.whichSemestersField) {
    errors.push('No whichSemestersField specified');
  }
  if (!data.isPublished) {
    errors.push('No isPublished specified');
  }
  if (!data.enrolmentEstimate) {
    errors.push('No enrolmentEstimate specified');
  }
  if (!data.enrolmentFinal) {
    errors.push('No enrolmentFinal specified');
  }
  if (!data.workload) {
    errors.push('No workload specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql =
    'INSERT INTO Course (courseID, courseName, year, whichSemestersField, isPublished, enrolmentEstimate, enrolmentFinal, workload, courseInfoDeadline, applicationDeadline, markerPrefDeadline, markerAssignmentDeadline, otherTasks) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)';
  const params = [
    data.courseID,
    data.courseName,
    data.year,
    data.whichSemestersField,
    data.isPublished,
    data.enrolmentEstimate,
    data.enrolmentFinal,
    data.workload,
    data.courseInfoDeadline ? data.courseInfoDeadline : '',
    data.applicationDeadline ? data.applicationDeadline : '',
    data.markerPrefDeadline ? data.markerPrefDeadline : '',
    data.markerAssignmentDeadline ? data.markerAssignmentDeadline : '',
    data.otherTasks ? data.otherTasks : '',
  ];

  db.run(sql, params).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const responseOk = (res: Response, data: RequestBody) => {
  res.json({
    message: 'success',
    data: data,
  });
};

const badRequest = (res: Response, error: string) => {
  res.status(400).json({ error: error });
};

export default router;
