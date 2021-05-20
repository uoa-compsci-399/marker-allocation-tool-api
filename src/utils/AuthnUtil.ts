import { Request } from 'express';

import db from '../db/DBController';
import { UserRow } from '../db/DatabaseTypes';

export enum PrivilegeLevel {
  None,
  LoggedIn,
  /* Marker is currently the lowest privilege level, but isn't defined as a synonym for LoggedIn
   * for extensibility
   */
  Marker,
  CourseCoordinator,
  MarkerCoordinator,
}

const map_role_to_privilege_level: Record<string, PrivilegeLevel> = {
  Marker: PrivilegeLevel.Marker,
  CourseCoordinator: PrivilegeLevel.CourseCoordinator,
  MarkerCoordinator: PrivilegeLevel.MarkerCoordinator,
};

export default class AuthnUtil {
  static async getCurrentUser(req: Request): Promise<UserRow | boolean> {
    const tokenValue = (req.cookies as Record<string, string>)['authn_token'];
    if (tokenValue == null) return false;

    const sql = 'SELECT * FROM User WHERE userID = (SELECT userID FROM UserToken WHERE value = ?)';
    const user = (await db.get(sql, [tokenValue])) as UserRow;
    if (user == null) return false;

    return user;
  }

  static async assertMinimumPrivilegeLevel(
    req: Request,
    minimum_level: PrivilegeLevel
  ): Promise<boolean> {
    if (minimum_level < PrivilegeLevel.LoggedIn) return true;

    const user = await this.getCurrentUser(req);

    if (minimum_level >= PrivilegeLevel.LoggedIn && user == false) return false;

    const user_level = map_role_to_privilege_level[(user as UserRow).role];
    return user_level >= minimum_level;
  }
}
