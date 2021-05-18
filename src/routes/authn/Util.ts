import express, { Request, Response } from 'express';

import db from '../../db/DBController';
import { UserRow } from '../../db/DatabaseTypes';

const router = express.Router();

router.get('/whoami', async (req: Request, res: Response) => {
  const tokenValue = (req.cookies as Record<string, string>)['authn_token'];
  if (tokenValue == null) return res.json({ authenticated: false });

  const sql = 'SELECT * FROM User WHERE userID = (SELECT userID FROM UserToken WHERE value = ?)';
  const user = (await db.get(sql, [tokenValue])) as UserRow;
  if (user == null) return res.json({ authenticated: false });

  res.json({
    authenticated: true,
    user: user,
  });
});

export default router;
