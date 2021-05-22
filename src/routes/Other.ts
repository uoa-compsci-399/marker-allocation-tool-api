import express, { Request, Response } from 'express';

import db from '../db/DBController';
import {
  CourseCoordinatorFull,
  RequestBody,
  CourseRequest,
  UserID,
  WorkloadDistribution,
  CourseID,
  StatusRequest,
} from '../utils/RequestBody';

const router = express.Router();

// Get a list of applications for a course
router.get('/course/:courseID/applications', (req: Request, res: Response) => {
  const sql = `SELECT ac.courseID, u.firstName || ' ' || u.lastName AS [applicantName], ac.applicationID 
               FROM Application a, ApplicationCourse ac, Marker m, User u
               WHERE ac.courseID = ?
               AND a.applicationID = ac.applicationID
               AND a.markerID = m.userID
               AND m.userID = u.userID`;
  const params = [req.params.courseID];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a list of allocated markers for a course
router.get('/course/:courseID/markers', (req: Request, res: Response) => {
  const sql = `SELECT u.userID, u.firstName || ' ' || u.lastName AS [markerName], ac.hoursAllocated
               FROM Application a, ApplicationCourse ac, Marker m, User u
               WHERE ac.courseID = ?
               AND a.applicationID = ac.applicationID
               AND a.markerID = m.userID
               AND m.userID = u.userID
               AND ac.status = 1`;
  const params = [req.params.courseID];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a count of the current number of applications for a course
router.get('/course/:courseID/application/total', (req: Request, res: Response) => {
  const sql = `SELECT COUNT(applicationCourseID) AS [count]
               FROM ApplicationCourse ac
               WHERE ac.courseID = ?`;
  const params = [req.params.courseID];

  db.get(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a count of the remaining number of marker spots open for a course
router.get('/course/:courseID/application/open', (req: Request, res: Response) => {
  const sql = `SELECT (SELECT preferredMarkerCount
                       FROM Course
                       WHERE courseID = ?) - COUNT(ac.applicationCourseID) AS [count]
               FROM Course c LEFT JOIN ApplicationCourse ac
               ON c.courseID = ac.courseID
               WHERE ac.courseID = ?
               AND ac.status = 1`;
  const params = [req.params.courseID, req.params.courseID];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a list of course coordinators
router.get('/coursecoordinators', (req: Request, res: Response) => {
  const sql = `SELECT firstName || ' ' || lastName  || ' - ' || upi AS [courseCoordinator]
               FROM User
               WHERE role = 'CourseCoordinator'`;
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      const data: string[] = [];
      value.forEach((courseCoordinatorFull: CourseCoordinatorFull) => {
        data.push(courseCoordinatorFull.courseCoordinator);
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

// Get a list of course coordinators and details
router.get('/coursecoordinators/details', (req: Request, res: Response) => {
  const sql = `SELECT u.userID, firstName, lastName, email, upi, IFNULL('[' || GROUP_CONCAT(courseName, ', ') || ']', '[]') AS [courses]
               FROM User u 
               LEFT JOIN CourseCoordinatorCourse ccc ON u.userID = ccc.courseCoordinatorID
               LEFT JOIN Course c ON ccc.courseID = c.courseID
               WHERE role = 'CourseCoordinator'
               GROUP BY userID`;
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

// POST Insert a course
router.post('/course/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as CourseRequest;

  if (!data.courseName) {
    errors.push('No courseName specified');
  }
  if (!data.preferredMarkerCount) {
    errors.push('No preferredMarkerCount specified');
  }
  if (!data.semesters) {
    errors.push('No semesters specified');
  }
  if (!data.year) {
    errors.push('No year specified');
  }
  if (data.isPublished == null) {
    errors.push('No isPublished specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  handleCourseInsert(data).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const handleCourseInsert = async (data: CourseRequest) => {
  const sql = `INSERT INTO Course (courseName, enrolmentEstimate, enrolmentFinal, expectedWorkload,
    preferredMarkerCount, semesters, year, applicationClosingDate, courseInfoDeadline, markerAssignmentDeadline, 
    markerPrefDeadline, isPublished, otherNotes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const params = [
    data.courseName,
    data.enrolmentEstimate,
    data.enrolmentFinal,
    data.expectedWorkload,
    data.preferredMarkerCount,
    data.semesters,
    data.year,
    data.applicationClosingDate ? data.applicationClosingDate : '',
    data.courseInfoDeadline ? data.courseInfoDeadline : '',
    data.markerAssignmentDeadline ? data.markerAssignmentDeadline : '',
    data.markerPrefDeadline ? data.markerPrefDeadline : '',
    data.isPublished,
    data.otherNotes ? data.otherNotes : '',
  ];

  await db.run(sql, params);

  const courseID = await db
    .get('SELECT courseID FROM Course ORDER BY courseID DESC limit 1', [])
    .then((value: CourseID) => {
      return value.courseID;
    });

  for (const coordinator of data.courseCoordinators) {
    const getUserID = 'SELECT userID FROM User WHERE upi = ?';

    const userID: string = await db
      .get(getUserID, [coordinator.trim().split(' - ')[1]])
      .then((value: UserID) => value.userID);

    const coordinatorInsert = `INSERT INTO CourseCoordinatorCourse (courseCoordinatorID, courseID, permissions) VALUES (?,?,?)`;
    const coordinatorParam = [userID, courseID, 0b111];

    await db.run(coordinatorInsert, coordinatorParam);
  }

  const workloads = <WorkloadDistribution[]>JSON.parse(data.workloadDistributions);
  for (const workload of workloads) {
    const workloadInsert = `INSERT INTO WorkloadDistribution (courseID, assignment, workload) VALUES (?,?,?)`;
    const workloadParam = [courseID, workload.assignment, workload.workload];

    await db.run(workloadInsert, workloadParam);
  }
};

// POST edit a course
router.post('/course/edit', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as CourseRequest;

  if (!data.courseID) {
    errors.push('No courseID specified');
  }
  if (!data.courseName) {
    errors.push('No courseName specified');
  }
  if (!data.preferredMarkerCount) {
    errors.push('No preferredMarkerCount specified');
  }
  if (!data.semesters) {
    errors.push('No semesters specified');
  }
  if (!data.year) {
    errors.push('No year specified');
  }
  if (data.isPublished == null) {
    errors.push('No isPublished specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  handleCourseEdit(data).then(
    () => {
      responseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const handleCourseEdit = async (data: CourseRequest) => {
  const sql = `UPDATE Course 
               SET courseName = ?, 
               enrolmentEstimate = ?, 
               enrolmentFinal = ?, 
               expectedWorkload = ?,
               preferredMarkerCount = ?, 
               semesters = ?, 
               year = ?, 
               applicationClosingDate = ?, 
               courseInfoDeadline = ?, 
               markerAssignmentDeadline = ?,
               markerPrefDeadline = ?, 
               isPublished = ?, 
               otherNotes = ? 
               WHERE courseID = ?`;

  const params = [
    data.courseName,
    data.enrolmentEstimate,
    data.enrolmentFinal,
    data.expectedWorkload,
    data.preferredMarkerCount,
    data.semesters,
    data.year,
    data.applicationClosingDate ? data.applicationClosingDate : '',
    data.courseInfoDeadline ? data.courseInfoDeadline : '',
    data.markerAssignmentDeadline ? data.markerAssignmentDeadline : '',
    data.markerPrefDeadline ? data.markerPrefDeadline : '',
    data.isPublished,
    data.otherNotes ? data.otherNotes : '',
    data.courseID,
  ];

  await db.run(sql, params);

  await db.run(
    `DELETE FROM CourseCoordinatorCourse 
                WHERE courseID = ?`,
    [data.courseID]
  );

  await db.run(
    `DELETE FROM WorkloadDistribution 
                WHERE courseID = ?`,
    [data.courseID]
  );

  const courseID = data.courseID;

  for (const coordinator of data.courseCoordinators) {
    const getUserID = 'SELECT userID FROM User WHERE upi = ?';

    const userID: string = await db
      .get(getUserID, [coordinator.trim().split(' - ')[1]])
      .then((value: UserID) => value.userID);

    const coordinatorInsert = `INSERT INTO CourseCoordinatorCourse (courseCoordinatorID, courseID, permissions) VALUES (?,?,?)`;
    const coordinatorParam = [userID, courseID, 0b111];

    await db.run(coordinatorInsert, coordinatorParam);
  }

  const workloads = <WorkloadDistribution[]>JSON.parse(data.workloadDistributions);
  for (const workload of workloads) {
    const workloadInsert = `INSERT INTO WorkloadDistribution (courseID, assignment, workload) VALUES (?,?,?)`;
    const workloadParam = [courseID, workload.assignment, workload.workload];

    await db.run(workloadInsert, workloadParam);
  }
};

// POST Insert a user
router.post('/status/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as StatusRequest;

  if (!data.applicationID) {
    errors.push('No applicationID specified');
  }
  if (!data.courseID) {
    errors.push('No courseID specified');
  }
  if (!data.status) {
    errors.push('No status specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql = `UPDATE ApplicationCourse 
     SET status = ?
     WHERE applicationID = ?
     AND courseID = ?`;
  const params = [data.status, data.applicationID, data.courseID];

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
