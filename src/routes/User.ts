import express, { Request, Response, NextFunction } from 'express';
import db from '../db/DBController';

const router = express.Router();

// Get a list of users
router.get('/users', (req: Request, res: Response, next: NextFunction) => {
  const sql = 'select * from User';
  const params: string[] = [];

  db.all(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason) => {
      badRequest(res, reason.message);
    }
  );
});

// Get a single user info(row) by userId
router.get('/user/:userID', (req: Request, res: Response, next: NextFunction) => {
  const sql = 'select * from user where userID = ?';
  const params = [req.params.userID];

  db.get(sql, params).then(
    (value) => {
      responseOk(res, value);
    },
    (reason) => {
      badRequest(res, reason.message);
    }
  );
});

// POST Insert a user
router.post('/user/', (req: Request, res: Response, next: NextFunction) => {
  const errors = [];

  if (!req.body.userID) {
    errors.push('No userId specified');
  }
  if (!req.body.firstName) {
    errors.push('No firstName specified');
  }
  if (!req.body.lastName) {
    errors.push('No lastName specified');
  }
  if (!req.body.email) {
    errors.push('No email specified');
  }
  if (!req.body.role) {
    errors.push('No role specified');
  }
  if (errors.length) {
    res.status(400).json({ error: errors.join(',') });
    return;
  }
  const data = {
    userID: req.body.userID,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    role: req.body.role,
  };

  const sql = 'INSERT INTO User (userID, firstName, lastName, email, role) VALUES (?,?,?,?,?)';
  const params = [data.userID, data.firstName, data.lastName, data.email, data.role];
  db.run(sql, params).then(
    () => {
      responseOk(res, data);
    },
    (reason) => {
      badRequest(res, reason.message);
    }
  );
});

const responseOk = (res: Response, data: any) => {
  res.json({
    message: 'success',
    data: data,
  });
};

const badRequest = (res: Response, error: string) => {
  res.status(400).json({ error: error });
};

export default router;
