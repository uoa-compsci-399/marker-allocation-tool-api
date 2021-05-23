import express, { Request, Response } from 'express';

import db from '../db/DBController';
import { ApplicationRow } from '../db/DatabaseTypes';
import {
  RequestBody,
  UserRequest,
  ApplicationRequest,
  UserID,
  CourseID,
  ApplicationRequestPreAuth,
  Marker,
  ActiveCourse,
} from '../utils/RequestBody';

//TODO: Split this file into individual route files

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

// Get a list of markers
router.get('/markers', (req: Request, res: Response) => {
  getAllData(req, res, 'Marker');
});

// Get a list of courses
router.get('/courses', (req: Request, res: Response) => {
  const sql = `SELECT c.courseID, c.courseName, c.enrolmentEstimate, c.enrolmentFinal, 
               c.expectedWorkload, c.preferredMarkerCount, 
               GROUP_CONCAT(u.firstName || ' ' || u.lastName || ' - ' || u.upi, ", ") AS [courseCoordinators], 
               c.semesters, c.year, c.applicationClosingDate, c.courseInfoDeadline, c.markerAssignmentDeadline, 
               c.markerPrefDeadline, c.isPublished, c.otherNotes 
               FROM Course c, CourseCoordinatorCourse ccc, User u
               WHERE c.courseID = ccc.courseID
               AND ccc.courseCoordinatorID = u.userID
               GROUP BY c.courseID`;

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

// Get a list of available/open courses
router.get('/courses/available', (req: Request, res: Response) => {
  const sql = `SELECT c.courseName
               FROM Course c
               WHERE DATE('now') <= DATE(c.applicationClosingDate)
               AND isPublished = 1`;

  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      const data: string[] = [];
      value.forEach((activeCourse: ActiveCourse) => {
        data.push(activeCourse.courseName);
      });

      res.json({
        message: 'success',
        data: data,
      });
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a list of available/open courses and details
router.get('/courses/available/details', (req: Request, res: Response) => {
  const sql = `SELECT c.courseID, c.courseName, c.expectedWorkload, IFNULL(sub.workloadDistributions, '') AS [workloadDistributions]
               FROM (SELECT c.courseID, '{"data":' || '[' || GROUP_CONCAT('{"assignment": "' || wd.assignment || '", "workload": "' || wd.workload || '"}', ', ') || ']' || '}' AS [workloadDistributions]
                     FROM Course c LEFT JOIN WorkloadDistribution wd ON c.courseID = wd.courseID
                     GROUP BY c.courseID) sub
               LEFT JOIN Course c ON sub.courseID = c.courseID
               WHERE DATE('now') <= DATE(c.applicationClosingDate)
               AND isPublished = 1;`;

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

router.get('/application/:applicationID/nofiles', (req: Request, res: Response) => {
  const columnList = [
    'applicationID',
    'markerID',
    'year',
    'availability',
    'availabilityConstraint',
    'relevantExperience',
    //'curriculumVitae',
    //'academicRecord',
    'areaOfStudy',
    'enrolmentStatus',
    'workEligible',
    'inAuckland',
    'declaration',
  ].join(', ');

  const sql = 'SELECT ' + columnList + ' FROM Application WHERE applicationID = ?';

  db.get(sql, [req.params.applicationID]).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

router.get('/application/:applicationID/curriculumvitae', (req: Request, res: Response) => {
  const sql = 'SELECT curriculumVitae FROM Application WHERE applicationID = ?';

  db.get(sql, [req.params.applicationID]).then(
    (value: ApplicationRow) => {
      if (!value.curriculumVitae) {
        res.sendStatus(400);
        return;
      }
      res.type('application/pdf');
      res.send(value.curriculumVitae);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

router.get('/application/:applicationID/academicrecord', (req: Request, res: Response) => {
  const sql = 'SELECT academicRecord FROM Application WHERE applicationID = ?';

  db.get(sql, [req.params.applicationID]).then(
    (value: ApplicationRow) => {
      if (!value.academicRecord) {
        res.sendStatus(400);
        return;
      }
      res.type('application/pdf');
      res.send(value.academicRecord);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a single marker row by userID
router.get('/marker/:userID', (req: Request, res: Response) => {
  getSingleRow(req, res, 'Marker', 'userID');
});

// Get a single course row by courseID
router.get('/course/:courseID', (req: Request, res: Response) => {
  const sql = `SELECT c.courseID, c.courseName, c.enrolmentEstimate, c.enrolmentFinal, 
                      c.expectedWorkload, c.preferredMarkerCount, 
                      GROUP_CONCAT(u.firstName || ' ' || u.lastName  || ' - ' || u.upi, ', ') AS [courseCoordinators], 
                      c.semesters, c.year, sub.workloadDistributions, c.applicationClosingDate, c.courseInfoDeadline, 
                      c.markerAssignmentDeadline, c.markerPrefDeadline, c.isPublished, c.otherNotes 
                FROM (SELECT c.courseID, '{"data":' || '[' || GROUP_CONCAT('{"assignment": "' || wd.assignment || '", "workload": "' || wd.workload || '"}', ', ') || ']' || '}' AS [workloadDistributions]
                      FROM Course c LEFT JOIN WorkloadDistribution wd ON c.courseID = wd.courseID
                      WHERE c.courseID = ?) sub
                LEFT JOIN Course c ON sub.courseID = c.courseID
                LEFT JOIN CourseCoordinatorCourse ccc ON c.courseID = ccc.courseID
                LEFT JOIN User u ON ccc.courseCoordinatorID = u.userID
                WHERE c.courseID = ?;`;

  const params = [req.params.courseID, req.params.courseID];

  db.get(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
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
  if (!data.upi) {
    errors.push('No upi specified');
  }
  if (!data.role) {
    errors.push('No role specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql =
    'INSERT INTO User (userID, firstName, lastName, email, upi, role) VALUES (?,?,?,?,?,?)';
  const params = [data.userID, data.firstName, data.lastName, data.email, data.upi, data.role];

  db.run(sql, params).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// POST Insert a course coordinator
router.post('/user/coordinator', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as UserRequest;

  if (!data.firstName) {
    errors.push('No firstName specified');
  }
  if (!data.lastName) {
    errors.push('No lastName specified');
  }
  if (!data.email) {
    errors.push('No email specified');
  }
  if (!data.upi) {
    errors.push('No upi specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  handleCoordinatorInsert(data).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const handleCoordinatorInsert = async (data: UserRequest) => {
  const sql = `INSERT INTO User (firstName, lastName, email, upi, role) VALUES (?,?,?,?,?);`;
  const params = [data.firstName, data.lastName, data.email, data.upi, 'CourseCoordinator'];

  await db.run(sql, params);

  const userID = await db
    .get('SELECT userID FROM User ORDER BY userID DESC LIMIT 1', [])
    .then((value: UserID) => {
      return value.userID;
    });

  const sql2 = `INSERT INTO CourseCoordinator (userID) VALUES (?)`;
  const params2 = [userID];

  await db.run(sql2, params2);
};

// POST edit a coordinator
router.post('/user/coordinator/edit', (req: Request, res: Response) => {
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
  if (!data.upi) {
    errors.push('No upi specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql = `UPDATE User 
               SET firstName = ?,
                   lastName = ?,
                   email = ?,
                   upi = ?
               WHERE userID = ?`;
  const params = [data.firstName, data.lastName, data.email, data.upi, data.userID];

  db.run(sql, params).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// POST Insert an application
router.post('/application/', (req: Request, res: Response) => {
  const errors = [];

  const requestData = req.body as ApplicationRequestPreAuth;

  const requestDataFields = [
    'firstName',
    'lastName',
    'studentId',
    'email',
    'upi',
    'selectedCourses',
    'areaOfStudy',
    'dateOfBirth',
    'enrolmentStatus',
    'availability',
    'academicRecord',
    'curriculumVitae',
    'workEligible',
    'inAuckland',
    'declaration',
  ];

  for (const field of requestDataFields) {
    if (requestData[field as keyof ApplicationRequestPreAuth] == null) {
      errors.push(`No ${field} specified`);
    }
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(', ') });
    return;
  }

  requestData.availabilityConstraint = requestData.availabilityConstraint
    ? requestData.availabilityConstraint
    : '';
  requestData.relevantExperience = requestData.relevantExperience
    ? requestData.relevantExperience
    : '';

  handleApplicationInsertPreAuth(requestData).then(
    () => {
      responseOk(res, requestData);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const handleApplicationInsert = async (data: ApplicationRequest) => {
  const sql = `INSERT INTO Application (applicationID, markerID, year, whichSemestersField,
    curriculumVitae, academicRecord, hoursRequested, relevantExperience) VALUES
    (?,?,?,?,?,?,?,?,?)`;
  const params = [
    data.applicationID,
    data.markerID,
    data.year,
    data.whichSemestersField,
    data.curriculumVitae,
    data.academicRecord,
    data.hoursRequested,
    data.relevantExperience ? data.relevantExperience : '',
  ];

  await db.run(sql, params);

  for (const course of data.selectedCourse) {
    const getCourseID = 'SELECT courseID FROM Course WHERE courseName = ?';

    const courseID: string = await db
      .get(getCourseID, [course.trim()])
      .then((value: CourseID) => value.courseID);

    const query =
      'INSERT INTO ApplicationCourse (applicationID, courseID, status, hoursAllocated) VALUES ' +
      '(?,?,?,?)';
    const param = [data.applicationID, courseID, '0', '0'];

    await db.run(query, param);
  }
};

// Hack to suppress unused warnings on handleApplicationInsert() since we'll want that code
// for handing applications once the Authentication system is in place.
((_) => _)(handleApplicationInsert);

const handleApplicationInsertPreAuth = async (requestData: ApplicationRequestPreAuth) => {
  // Pre-auth behavior:
  //  check for a Marker with this studentID, and create one if there isn't one
  //  to create a Marker, check for a User with this fN, lN, and email and role == "Marker"

  let markerID = await db
    .get('SELECT userID FROM Marker WHERE studentID = ?', [requestData.studentId])
    .then((value: Marker) => (value ? value.userID : undefined));

  if (!markerID) {
    const userID = (
      await db.run('INSERT INTO User (firstName, lastName, email, upi, role) VALUES (?,?,?,?,?)', [
        requestData.firstName,
        requestData.lastName,
        requestData.email,
        requestData.upi,
        'Marker',
      ])
    ).id;

    markerID = (
      await db.run('INSERT INTO Marker (userID, studentId, dateOfBirth) VALUES (?,?,?)', [
        userID,
        requestData.studentId,
        requestData.dateOfBirth,
      ])
    ).id;
  }

  // With-auth behavior:
  //   check whether this User is a (role == "Marker"); reject if not
  //   create Application for their corresponding Marker

  const availabilityField =
    (+requestData.availability.includes('Summer School') << 0) |
    (+requestData.availability.includes('Semester One') << 1) |
    (+requestData.availability.includes('Semester Two') << 2);

  const applicationID = (
    await db.run(
      'INSERT INTO Application (markerID, year, availability, availabilityConstraint, relevantExperience, curriculumVitae, academicRecord, ' +
        'areaOfStudy, enrolmentStatus, workEligible, inAuckland, declaration) VALUES ' +
        '(?,?,?,?,?,?,?,?,?,?,?,?)',
      [
        markerID,
        new Date().getFullYear(),
        availabilityField,
        requestData.availabilityConstraint,
        requestData.relevantExperience,
        Buffer.from(requestData.curriculumVitae),
        Buffer.from(requestData.academicRecord),
        requestData.areaOfStudy,
        requestData.enrolmentStatus,
        +requestData.workEligible,
        +requestData.inAuckland,
        +requestData.declaration,
      ]
    )
  ).id;

  for (const course of requestData.selectedCourses) {
    const courseID: string = await db
      .get('SELECT courseID FROM Course WHERE courseName = ?', [course.trim()])
      .then((value: CourseID) => value.courseID);

    await db.run(
      'INSERT INTO ApplicationCourse (applicationID, courseID, status, hoursAllocated) VALUES ' +
        '(?,?,?,?)',
      [applicationID, courseID, 0, 0]
    );
  }
};

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
