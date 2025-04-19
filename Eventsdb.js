const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database or open it if it already exists
const db = new sqlite3.Database('events.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database opened successfully.');
  }
});

// SQL query to create the events table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventName TEXT NOT NULL,
    clubName TEXT NOT NULL,
    date1 TEXT NOT NULL,
    date2 TEXT NOT NULL,
    venue1 TEXT NOT NULL,
    venue2 TEXT NOT NULL,
    venue3 TEXT NOT NULL,
    timeFrom TEXT NOT NULL,
    timeTo TEXT NOT NULL,
    eventDescription TEXT NOT NULL,
    studentCoord1 TEXT NOT NULL,
    phone1 TEXT NOT NULL,
    studentCoord2 TEXT,
    phone2 TEXT,
    facultyCoord TEXT NOT NULL,
    clubEmail TEXT NOT NULL,
    fee REAL NOT NULL
  );
`;

// Create the table if it doesn't already exist
db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table "events" created successfully.');
  }
});

// Close the database connection
db.close((err) => {
  if (err) {
    console.error('Error closing the database:', err);
  } else {
    console.log('Database closed.');
  }
});
