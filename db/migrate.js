import sqlite3 from 'sqlite3';
import { DB_FILE } from '../config/dbConfig.js';

const sql = `
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user TEXT NOT NULL,
  amount REAL NOT NULL,
  item TEXT NOT NULL,
  category TEXT,
  created_at TEXT NOT NULL
);
`;

const db = new sqlite3.Database(DB_FILE);
db.serialize(() => {
  db.run(sql, (err) => {
    if (err) {
      console.error('Migration error:', err);
      process.exit(1);
    } else {
      console.log('Migration completed.');
      db.close();
    }
  });
});
