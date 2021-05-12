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
router.get('/course/:courseID/applicationcount', (req: Request, res: Response) => {
  const sql = `SELECT COUNT(applicationCourseID) AS [count]
               FROM ApplicationCourse ac
               WHERE ac.courseID = ?`;
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
