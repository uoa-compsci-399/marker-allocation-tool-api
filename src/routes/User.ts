import express, { Request, Response } from 'express';
import db from '../db/DBController';
import { UserRequest, ApplicationRequest } from '../utils/RequestBody';

const router = express.Router();

// Get a list of users
router.get('/users', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM User';
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      userResponseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a single user info(row) by userId
router.get('/user/:userID', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM User WHERE userID = ?';
  const params = [req.params.userID];

  db.get(sql, params).then(
    (value) => {
      userResponseOk(res, value);
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
    errors.push('No userId specified');
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
      userResponseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a list of applications
router.get('/applications', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM Application';
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      applicationResponseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a single user info(row) by applicationId
router.get('/application/:applicationID', (req: Request, res: Response) => {
  const sql = 'SELECT * FROM Application WHERE applicationID = ?';
  const params = [req.params.applicationID];

  db.get(sql, params).then(
    (value) => {
      applicationResponseOk(res, value);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

// POST Insert a user
router.post('/application/', (req: Request, res: Response) => {
  const errors = [];

  const data = req.body as ApplicationRequest;

  if (!data.applicationID) {
    errors.push('No applicationId specified');
  }
  if (!data.applicantID) {
    errors.push('No applicantID specified');
  }
  if (!data.courseID) {
    errors.push('No courseID specified');
  }
  if (!data.CV) {
    errors.push('No CV specified');
  }

  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }

  const sql =
    'INSERT INTO Application (applicationID, applicantID, courseID, CV, relevantExperience) VALUES (?,?,?,?,?)';
  const params = [
    data.applicationID,
    data.applicantID,
    data.courseID,
    data.CV,
    data.relevantExperience ? data.relevantExperience : '',
  ];

  db.run(sql, params).then(
    () => {
      applicationResponseOk(res, data);
    },
    (reason: Error) => {
      badRequest(res, reason.message);
    }
  );
});

const userResponseOk = (res: Response, data: UserRequest) => {
  res.json({
    message: 'success',
    data: data,
  });
};

const applicationResponseOk = (res: Response, data: ApplicationRequest) => {
  res.json({
    message: 'success',
    data: data,
  });
};

const badRequest = (res: Response, error: string) => {
  res.status(400).json({ error: error });
};

export default router;
