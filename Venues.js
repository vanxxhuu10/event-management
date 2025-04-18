const sqlite3 = require('sqlite3').verbose();

// Create or open the SQLite database (Venues.db)
const db = new sqlite3.Database('./Venues.db', (err) => {
  if (err) {
    console.error('Error opening the database:', err.message);
  } else {
    console.log('Connected to the SQLite database');
    
    // Create tables after ensuring database is connected
    createTables();
  }
});

// Function to create the required tables
function createTables() {
  // Create VenuesAlloted table
  const createVenuesAllotedTable = `
    CREATE TABLE IF NOT EXISTS VenuesAlloted (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      event_name TEXT,
      club_name TEXT,
      venue_alloted TEXT,
      time_from TEXT,
      time_to TEXT
    );
  `;

  // Create VenuesPending table
  const createVenuesPendingTable = `
    CREATE TABLE IF NOT EXISTS VenuesPending (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      venue_pending TEXT,
      reason TEXT
    );
  `;

  // Create AllVenues table
  const createAllVenuesTable = `
    CREATE TABLE IF NOT EXISTS AllVenues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      venue_name TEXT
    );
  `;

  // Execute the queries to create the tables in a serial manner
  db.serialize(() => {
    db.run(createVenuesAllotedTable, (err) => {
      if (err) {
        console.error('Error creating VenuesAlloted table:', err.message);
      } else {
        console.log('VenuesAlloted table created successfully');
      }
    });

    db.run(createVenuesPendingTable, (err) => {
      if (err) {
        console.error('Error creating VenuesPending table:', err.message);
      } else {
        console.log('VenuesPending table created successfully');
      }
    });

    db.run(createAllVenuesTable, (err) => {
      if (err) {
        console.error('Error creating AllVenues table:', err.message);
      } else {
        console.log('AllVenues table created successfully');
      }
    });

    // Close the database connection after all queries have been executed
    db.close((err) => {
      if (err) {
        console.error('Error closing the database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
}
