const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create (or open if exists) Final_Events.db
const dbPath = path.join(__dirname, 'Final_Events.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Error opening database:', err.message);
    }
    console.log('✅ Connected to Final_Events.db');
});

// Create the final_events table with the required structure
db.run(`
    CREATE TABLE IF NOT EXISTS final_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        present_date TEXT NOT NULL,
        event_name TEXT NOT NULL,
        club_name TEXT NOT NULL,
        date_allotted TEXT NOT NULL,
        venue_allotted TEXT NOT NULL,
        time_from TEXT NOT NULL,
        time_to TEXT NOT NULL,
        student_coord1 TEXT NOT NULL,
        phone1 TEXT NOT NULL,
        student_coord2 TEXT NOT NULL,
        phone2 TEXT NOT NULL,
        club_mail TEXT NOT NULL,
        reg_fee REAL NOT NULL,
        approved_by TEXT NOT NULL,
        date_of_approval TEXT NOT NULL,
        comments TEXT
    )
`, (err) => {
    if (err) {
        return console.error('Error creating table:', err.message);
    }
    console.log('✅ final_events table is ready.');
});

// Optional: Close DB connection after creation
db.close((err) => {
    if (err) {
        return console.error('Error closing database:', err.message);
    }
    console.log('✅ Database connection closed.');
});
