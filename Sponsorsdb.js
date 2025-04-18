const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database or open it if it already exists
const db = new sqlite3.Database('sponsors.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database opened successfully.');
  }
});

// SQL query to create the posters table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS sponsors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clubName TEXT NOT NULL,
    event_date TEXT,
    event_name TEXT,
    sponsor_name TEXT,
    amount REAL,
    status TEXT,
    upload_on TEXT DEFAULT CURRENT_TIMESTAMP
  );
`;

// Create the table if it doesn't already exist
db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table "posters" created successfully.');
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
