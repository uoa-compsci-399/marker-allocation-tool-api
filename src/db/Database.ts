import * as sqlite3 from 'sqlite3';
import DBDataUtil from './DBDataUtil';
import { RequestBody } from '../utils/RequestBody';

sqlite3.verbose();
const DBSOURCE = 'db.sqlite';

type Id = { id: number };

export default class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DBSOURCE, (err) => {
      if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
      } else {
        DBDataUtil.initialize(this.db);
      }
    });
  }

  run(sql: string, params: string[] = []): Promise<Id> {
    return new Promise<Id>((resolve, reject) => {
      this.db = new sqlite3.Database(DBSOURCE);
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      this.db.close();
    });
  }

  get(sql: string, params: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DBSOURCE);
      this.db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      this.db.close();
    });
  }

  all(sql: string, params: string[] = []): Promise<RequestBody> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DBSOURCE);
      this.db.all(sql, params, (err, rows: RequestBody) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
      this.db.close();
    });
  }
}
