import express, { Request, Response } from 'express';
import db from '../db/DBController';
import { RequestBody } from '../utils/RequestBody';

const router = express.Router();

// Get a list of users
router.get('/users', (req: Request, res: Response) => {
  const sql = 'select * from User';
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

// Get a single user info(row) by userId
router.get('/user/:userID', (req: Request, res: Response) => {
  const sql = 'select * from user where userID = ?';
  const params = [req.params.userID];

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

  const data = req.body as RequestBody;

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
