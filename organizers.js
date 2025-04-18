const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('organizers.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS organizers (
    identity TEXT NOT NULL,
    id TEXT PRIMARY KEY,
    password TEXT NOT NULL
  )`);

  const stmt = db.prepare(`INSERT INTO organizers (identity, id, password) VALUES (?, ?, ?)`);

  stmt.finalize();
});

db.close();
