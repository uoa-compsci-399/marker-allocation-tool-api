import * as sqlite3 from 'sqlite3';

export default class SQLiteUtil {
  static createTable(db: sqlite3.Database, name: string, cols: string[]): void {
    const sqlCols = cols.join(', ');
    const sqlCmd = `CREATE TABLE IF NOT EXISTS "${name}" (${sqlCols});`;
    db.run(sqlCmd, (err: Error) => {
      if (err == null) return;
      console.error(err);
    });
  }

  static insertIntoTableAsObject(
    db: sqlite3.Database,
    onFailIgnore: boolean,
    tableName: string,
    row: Record<string, unknown>
  ): void {
    const sqlKeys = Object.keys(row).join(', ');
    const sqlValues = Object.keys(row)
      .map(() => `?`)
      .join(', ');
    const sqlRow = `(${sqlKeys}) VALUES (${sqlValues})`;
    const sqlVerb = onFailIgnore ? 'INSERT OR IGNORE INTO' : 'INSERT INTO';
    const sqlCmd = `${sqlVerb} "${tableName}" ${sqlRow}`;
    db.serialize(() => {
      db.run(sqlCmd, Object.values(row), (err: Error) => {
        if (err == null) return;
        console.error(err);
      });
    });
  }

  static insertMultipleIntoTableAsArrayObject(
    db: sqlite3.Database,
    onFailIgnore: boolean,
    tableName: string,
    subtable: Record<string, unknown[]>
  ): void {
    const subcolLengths = Object.values(subtable).map((subcol) => subcol.length);
    if (new Set(subcolLengths).size > 1) {
      throw new Error('All value arrays in subtable must be the same length');
    }

    let row: Record<string, unknown>;
    for (let i = 0; i < subcolLengths[0]; i++) {
      row = {};
      Object.keys(subtable).forEach((key) => {
        row[key] = subtable[key][i];
      });
      this.insertIntoTableAsObject(db, onFailIgnore, tableName, row);
    }
  }
}

