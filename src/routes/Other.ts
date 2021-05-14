import express, { Request, Response } from 'express';

import db from '../db/DBController';
import { CourseCoordinatorFull, RequestBody, CourseRequest, UserID } from '../utils/RequestBody';

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
  const sql = `SELECT (SELECT preferredMarkers
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

// POST Insert a course
router.post('/course/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as CourseRequest;

  if (!data.courseName) {
    errors.push('No courseName specified');
  }
  if (!data.enrolmentEstimate) {
    errors.push('No enrolmentEstimate specified');
  }
  if (!data.enrolmentFinal) {
    errors.push('No enrolmentFinal specified');
  }
  if (!data.expectedWorkload) {
    errors.push('No expectedWorkload specified');
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
  if (!data.isPublished) {
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
  const sql = `INSERT INTO Course (courseID, courseName, enrolmentEstimate, enrolmentFinal, expectedWorkload,
    preferredMarkerCount, semesters, year, applicationClosingDate, courseInfoDeadline, markerAssignmentDeadline, 
    markerPrefDeadline, isPublished, otherNotes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

  const params = [
    data.courseID,
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

  data.courseCoordinators = data.courseCoordinators.slice(1, -1)

  for (const coordinator of data.courseCoordinators.split(', ')) {
    const getUserID = 'SELECT userID FROM User WHERE upi = ?';

    const userID: string = await db
      .get(getUserID, [coordinator.trim().split(' - ')[1]])
      .then((value: UserID) => value.userID);

    const query = `INSERT INTO CourseCoordinatorCourse (courseCoordinatorID, courseID, permissions) VALUES (?,?,?)`;
    const param = [userID, data.courseID, 0b111];

    await db.run(query, param);
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
