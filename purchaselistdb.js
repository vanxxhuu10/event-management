const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database or open it if it already exists
const db = new sqlite3.Database('purchaselist.db', (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Database opened successfully.');
  }
});

// SQL query to create the purchaselist table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS purchaselist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    clubName TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_name TEXT NOT NULL,
    item_name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    source TEXT NOT NULL,
    amount REAL NOT NULL,
    upload_time TEXT NOT NULL
  );
`;

// Create the table if it doesn't already exist
db.run(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('Table "purchaselist" created successfully.');
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
