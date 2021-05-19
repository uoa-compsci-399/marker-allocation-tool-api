import { Request } from 'express';

import db from '../db/DBController';
import { UserRow } from '../db/DatabaseTypes';

export default class AuthnUtil {
  static async getCurrentUser(req: Request): Promise<UserRow | boolean> {
    const tokenValue = (req.cookies as Record<string, string>)['authn_token'];
    if (tokenValue == null) return false;

    const sql = 'SELECT * FROM User WHERE userID = (SELECT userID FROM UserToken WHERE value = ?)';
    const user = (await db.get(sql, [tokenValue])) as UserRow;
    if (user == null) return false;

    return user;
  }
}
