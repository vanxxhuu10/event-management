const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false // Required for Railway, Neon, etc.
  }
});

// Create the events table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
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

pool.connect()
  .then(client => {
    return client.query(createTableQuery)
      .then(() => {
        console.log('✅ events table created or already exists.');
        client.release();
      })
      .catch(err => {
        client.release();
        console.error('❌ Error creating events table:', err.stack);
      });
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.stack);
  });

module.exports = pool;
