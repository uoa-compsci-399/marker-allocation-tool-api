import * as sqlite from 'sqlite3';
import DBDataUtil from './DBDataUtil';

const sqlite3 = sqlite.verbose();
const DBSOURCE = 'db.sqlite';

class Database {
  private _db: sqlite.Database;

  constructor() {
    this._db = new sqlite3.Database(DBSOURCE, (err: any) => {
      if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
      } else {
        DBDataUtil(this._db);
      }
    });
  }

  run(sql: string, params: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db = new sqlite3.Database(DBSOURCE);
      this._db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
      this._db.close();
    });
  }

  get(sql: string, params: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db = new sqlite3.Database(DBSOURCE);
      this._db.get(sql, params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
      this._db.close();
    });
  }

  all(sql: string, params: string[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this._db = new sqlite3.Database(DBSOURCE);
      this._db.all(sql, params, (err: never, rows: never) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
      this._db.close();
    });
  }
}

export default Database;
