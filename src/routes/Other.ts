import express, { Request, Response } from 'express';

import db from '../db/DBController';
import { RequestBody } from '../utils/RequestBody';

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
  const sql = `SELECT firstName || ' ' || lastName AS [name], upi
               FROM User
               WHERE role = 'CourseCoordinator'`;
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
