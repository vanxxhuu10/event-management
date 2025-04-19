const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./db');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-eval'");

    next();
});

// API to verify organizer
app.post('/verify-organizer', (req, res) => {
    const dbPath = path.join(__dirname, 'organizers.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to organizers.db');
    }
});
    if (!req.body) {
        return res.status(400).json({ 
            success: false, 
            message: "No data received" 
        });
    }

    const { identity, id, password } = req.body;

    if (!identity || !id || !password) {
        return res.status(400).json({
            success: false,
            message: "Missing credentials"
        });
    }

    const query = "SELECT * FROM organizers WHERE identity = ? AND id = ? AND password = ?";

    db.get(query, [identity, id, password], (err, row) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({
                success: false,
                message: "Database error"
            });
        }

        if (row) {
            res.json({ success: true, user: row });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    });
});
// Login Route
// server.js

app.post('/login', (req, res) => {
    const { club_name, club_email, password } = req.body;

    if (!club_name || !club_email || !password) {
        return res.json({ success: false, error: 'Please fill in all fields.' });
    }

    const sql = 'SELECT * FROM users WHERE club_name = ? AND club_email = ? AND password = ?';

    db.get(sql, [club_name, club_email, password], (err, row) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.json({ success: false, error: 'Database error' });
        }

        if (row) {
            // Login successful
            return res.json({ success: true });
        } else {
            // Login failed
            return res.json({ success: false, error: 'Invalid credentials' });
        }
    });
});



// Signup Route
app.post('/signup', (req, res) => {
  const db = new sqlite3.Database('./users.db', (err) => {
    if (err) {
        console.error('Error connecting to users.db:', err);
    } else {
        console.log('Connected to users.db');
    }
});
  const { club_name, club_email, password, confirm_password } = req.body;

  if (!club_name || !club_email || !password || !confirm_password) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  if (password !== confirm_password) {
      return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  // Directly insert the password as plain text
  db.run(
      'INSERT INTO users (club_name, club_email, password) VALUES (?, ?, ?)',
      [club_name, club_email, password],  // Store password as plain text
      function (err) {
          if (err) {
              console.error('Error inserting user into database:', err);
              return res.status(500).json({ success: false, error: 'User already exists or DB error' });
          }

          // Successfully created user
          return res.json({ success: true, message: 'User registered successfully' });
      }
  );
});

app.post('/register-event', (req, res) => {
  const dbPath = path.join(__dirname, 'events.db');
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Failed to connect to database:', err.message);
    } else {
        console.log('✅ Connected to SQLite database.');
    }
});
  const {
      eventName, clubName, date1, date2, venue1, venue2, venue3,
      timeFrom, timeTo, eventDescription, studentCoord1, phone1,
      studentCoord2, phone2, facultyCoord, clubEmail, fee
  } = req.body;

  const query = `
      INSERT INTO events (
          eventName, clubName, date1, date2, venue1, venue2, venue3,
          timeFrom, timeTo, eventDescription, studentCoord1, phone1,
          studentCoord2, phone2, facultyCoord, clubEmail, fee
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
      eventName, clubName, date1, date2, venue1, venue2, venue3,
      timeFrom, timeTo, eventDescription, studentCoord1, phone1,
      studentCoord2, phone2, facultyCoord, clubEmail, fee
  ];

  db.run(query, values, function (err) {
      if (err) {
          console.error('❌ Error inserting event:', err.message);
          return res.json({ success: false, error: 'Failed to register event.' });
      }
      console.log('✅ Event inserted with ID:', this.lastID);
      res.json({ success: true, eventId: this.lastID });
  });
});

app.post('/submit-requirements', (req, res) => {
  const udsDB = new sqlite3.Database(path.join(__dirname, 'uds.db'));
const housekeepingDB = new sqlite3.Database(path.join(__dirname, 'housekeeping.db'));
const wifiDB = new sqlite3.Database(path.join(__dirname, 'wifi.db'));
  const { clubName, eventName, eventDate, udsData, housekeepingData, wifiData } = req.body;

  // 🔹 Insert UDS requirements
  udsData.forEach(item => {
      udsDB.run(
          `INSERT INTO uds (clubName, event_date, event_name, requirement_name, quantity) VALUES (?, ?, ?, ?, ?)`,
          [clubName, eventDate, eventName, item.requirement_name, item.quantity],
          (err) => {
              if (err) console.error("❌ UDS insert error:", err.message);
          }
      );
  });

  // 🔹 Insert Housekeeping requirements
  housekeepingData.forEach(item => {
      housekeepingDB.run(
          `INSERT INTO housekeeping (clubName, event_date, event_name, requirement_name, quantity) VALUES (?, ?, ?, ?, ?)`,
          [clubName, eventDate, eventName, item.requirement_name, item.quantity],
          (err) => {
              if (err) console.error("❌ Housekeeping insert error:", err.message);
          }
      );
  });

  // 🔹 Insert WiFi requirement (only one)
  const { requirement_name, quantity } = wifiData;
  wifiDB.run(
      `INSERT INTO wifi (clubName, event_date, event_name, requirement_name, quantity) VALUES (?, ?, ?, ?, ?)`,
      [clubName, eventDate, eventName, requirement_name, quantity],
      (err) => {
          if (err) {
              console.error("❌ WiFi insert error:", err.message);
              return res.status(500).json({ success: false, error: "WiFi insert failed" });
          }

          // ✅ All inserts done
          res.json({ success: true, message: "All requirements saved successfully." });
      }
  );
});

app.post('/submit-purchase-data', (req, res) => {
  const purchaselistDB = new sqlite3.Database(path.join(__dirname, 'purchaselist.db'), (err) => {
    if (err) {
      console.error("❌ Could not connect to purchaselist.db:", err.message);
    } else {
      console.log("✅ Connected to purchaselist.db");
    }
  });
  const { clubName, eventDate, eventName, onlineData, offlineData } = req.body;

  if (!clubName || !eventDate || !eventName || !Array.isArray(onlineData) || !Array.isArray(offlineData)) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const insertQuery = `
    INSERT INTO purchaselist (clubName, event_date, event_name, item_name, quantity, price, source, amount, upload_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  // Insert online items
  onlineData.forEach(item => {
    const { item_name, quantity, price, source, amount } = item;
    const uploadTime = new Date().toISOString(); // Get current time for upload_time
    purchaselistDB.run(insertQuery, [clubName, eventDate, eventName, item_name, quantity, price, source, amount, uploadTime], function (err) {
      if (err) {
        console.error("❌ Error inserting online item:", err.message);
        return res.status(500).json({ success: false, error: "Database insertion failed for online items." });
      }
    });
  });

  // Insert offline items
  offlineData.forEach(item => {
    const { item_name, quantity, price, source, amount } = item;
    const uploadTime = new Date().toISOString(); // Get current time for upload_time
    purchaselistDB.run(insertQuery, [clubName, eventDate, eventName, item_name, quantity, price, source, amount, uploadTime], function (err) {
      if (err) {
        console.error("❌ Error inserting offline item:", err.message);
        return res.status(500).json({ success: false, error: "Database insertion failed for offline items." });
      }
    });
  });

  // If everything is successful
  res.json({ success: true });
});

app.post('/submit-poster', (req, res) => {
  const postersDB = new sqlite3.Database(path.join(__dirname, 'posters.db'), (err) => {
    if (err) {
      console.error("❌ Could not connect to posters.db:", err.message);
    } else {
      console.log("✅ Connected to posters.db");
    }
  });
  const { clubName, eventDate, eventName, driveLink } = req.body;

  if (!clubName || !eventDate || !eventName || !driveLink) {
    return res.status(400).json({ success: false, error: "Missing required fields." });
  }

  const insertQuery = `
    INSERT INTO posters (clubName, event_date, event_name, drive_link)
    VALUES (?, ?, ?, ?)
  `;

  postersDB.run(insertQuery, [clubName, eventDate, eventName, driveLink], function (err) {
    if (err) {
      console.error("❌ Insert failed:", err.message);
      return res.status(500).json({ success: false, error: "Database insertion failed." });
    }

    console.log(`✅ Poster saved with ID ${this.lastID}`);
    res.json({ success: true });
  });
});

app.post('/submit-sponsors', (req, res) => {
  const sponsors = req.body;

  if (!Array.isArray(sponsors) || sponsors.length === 0) {
    return res.status(400).json({ success: false, error: "No sponsors data provided." });
  }

  const insertQuery = `
    INSERT INTO sponsors (clubName, event_date, event_name, sponsor_name, amount, status, upload_on)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  // Insert each sponsor
  sponsors.forEach(sponsor => {
    const sponsorsDB = new sqlite3.Database(path.join(__dirname, 'sponsors.db'), (err) => {
      if (err) {
        console.error("❌ Could not connect to sponsors.db:", err.message);
      } else {
        console.log("✅ Connected to sponsors.db");
      }
    });
    const { eventDate, eventName, sponsorName, sponsorAmount, status, clubName } = sponsor;
    const uploadTime = new Date().toISOString(); // Get current time for upload_on
    const amount = parseFloat(sponsorAmount); // Ensure amount is a number

    sponsorsDB.run(insertQuery, [clubName, eventDate, eventName, sponsorName, amount, status, uploadTime], function (err) {
      if (err) {
        console.error("❌ Error inserting sponsor:", err.message);
        return res.status(500).json({ success: false, error: "Database insertion failed for sponsor." });
      }
    });
  });

  // If all data inserted successfully
  res.json({ success: true });
});

app.get('/clubs', (req, res) => {
    const dbPath = path.join(__dirname, 'users.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to database:', err.message);
    } else {
        console.log('Connected to users.db');
    }
});
    const query = `SELECT club_name, club_email FROM users WHERE club_name IS NOT NULL AND club_email IS NOT NULL`;

    db.all(query, [], (err, rows) => {
        if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ error: 'Failed to fetch clubs' });
        }

        res.json(rows); // Send list of { club_name, club_email } objects
    });
});


app.get('/events/:clubName', (req, res) => {
  const clubName = req.params.clubName;

  // Define the path to the events.db file (assuming it's in the 'database' folder)
  const dbPath = path.join(__dirname, 'events.db');
  
  // Check if the database file exists
  if (!fs.existsSync(dbPath)) {
      return res.status(404).json({ error: `Events database not found` });
  }

  // Open the database connection
  const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
          console.error('Error connecting to events database:', err.message);
          return res.status(500).json({ error: 'Database connection error' });
      }
  });

  // Query to fetch events for the given clubName
  const query = `SELECT * FROM events WHERE clubName = ?`;

  // Execute the query with clubName as a parameter to prevent SQL injection
  db.all(query, [clubName], (err, rows) => {
      if (err) {
          console.error('Error fetching events:', err.message);
          return res.status(500).json({ error: 'Failed to fetch events' });
      }

      // Return the fetched rows as a JSON response
      res.json(rows);
  });
});

app.get('/api/requirements/:clubName', (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  const dbPaths = {
    uds: path.join(__dirname, 'uds.db'),
    housekeeping: path.join(__dirname, 'housekeeping.db'),
    wifi: path.join(__dirname, 'wifi.db'),
  };

  const fetchData = (dbPath, tableName) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
        if (err) return reject(`Error connecting to ${tableName}: ${err.message}`);
      });

      const query = `SELECT * FROM ${tableName} WHERE clubName = ? AND event_name = ?`;
      db.all(query, [clubName, eventName], (err, rows) => {
        db.close();
        if (err) return reject(`Query error in ${tableName}: ${err.message}`);
        resolve(rows);
      });
    });
  };

  Promise.all([
    fetchData(dbPaths.uds, 'uds'),
    fetchData(dbPaths.housekeeping, 'housekeeping'),
    fetchData(dbPaths.wifi, 'wifi'),
  ])
    .then(([uds, housekeeping, wifi]) => {
      res.json({ uds, housekeeping, wifi });
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Failed to fetch requirements data' });
    });
});

app.get('/api/posters/:clubName', (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  const dbPath = path.join(__dirname, 'posters.db');

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Posters database not found' });
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('DB connection error:', err.message);
      return res.status(500).json({ error: 'Failed to connect to posters database' });
    }
  });

  const query = `SELECT * FROM posters WHERE clubName = ? AND event_name = ?`;

  db.all(query, [clubName, eventName], (err, rows) => {
    db.close();
    if (err) {
      console.error('Error querying posters:', err.message);
      return res.status(500).json({ error: 'Error retrieving posters' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No posters found for this club and event' });
    }

    res.json({ posters: rows });
  });
});
  
app.get('/api/sponsors/:clubName', (req, res) => {
  const clubName = req.params.clubName;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  const dbPath = path.join(__dirname,'sponsors.db');

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Sponsors database not found' });
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('DB connection error:', err.message);
      return res.status(500).json({ error: 'Failed to connect to sponsors database' });
    }
  });

  const query = `SELECT * FROM sponsors WHERE clubName = ? AND event_name = ?`;

  db.all(query, [clubName, eventName], (err, rows) => {
    db.close();
    if (err) {
      console.error('Error querying sponsors:', err.message);
      return res.status(500).json({ error: 'Error retrieving sponsors data' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No sponsors found for this club and event' });
    }

    res.json({ sponsors: rows });
  });
});

app.get('/api/purchase/:club', (req, res) => {
  const clubName = req.params.club;
  const eventName = req.query.event;

  if (!clubName || !eventName) {
    return res.status(400).json({ error: 'Club name and event name are required' });
  }

  const dbPath = path.join(__dirname, 'purchaselist.db');

  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ error: 'Purchase list database not found' });
  }

  const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, err => {
    if (err) {
      console.error('DB connection error:', err.message);
      return res.status(500).json({ error: 'Database connection error' });
    }
  });

  const query = `
    SELECT event_date, event_name, item_name, quantity, price, source, amount, upload_time
    FROM purchaselist
    WHERE clubName = ? AND event_name = ?
  `;

  db.all(query, [clubName, eventName], (err, rows) => {
    db.close();

    if (err) {
      console.error('Error querying purchaselist:', err.message);
      return res.status(500).json({ error: 'Error fetching purchase list' });
    }

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No purchase items found for this club and event' });
    }

    res.json({ purchase: rows });
  });
});

  app.get('/api/venues', (req, res) => {
    const db = new sqlite3.Database('./Venues.db', (err) => {
        if (err) {
            console.error('Error connecting to database:', err.message);
            return res.status(500).json({ error: 'Database connection failed' });
        }
        console.log('Connected to Venues.db');

        const query = `SELECT venue_pending, reason FROM VenuesPending`;

        db.all(query, [], (err, rows) => {
            db.close(); // Close DB connection after query

            if (err) {
                console.error('Error fetching venues:', err.message);
                return res.status(500).json({ error: 'Internal Server Error' });
            }

            // Return array of objects: [{ venue_pending: ..., reason: ... }, ...]
            res.json(rows);
        });
    });
});

app.get('/api/all-venues', (req, res) => {
    const db = new sqlite3.Database('./Venues.db');
    const query = `SELECT venue_name FROM AllVenues`;
  
    db.all(query, [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  // Allotted Venues → all except `id` from VenuesAlloted
  app.get('/api/allotted-venues', (req, res) => {
    const db = new sqlite3.Database('./Venues.db');
    const query = `SELECT date, event_name, club_name, venue_alloted, time_from, time_to FROM VenuesAlloted`;
  
    db.all(query, [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });
  
  // Non-Allotted Venues → all except `id` from VenuesPending
  app.get('/api/nonallotted-venues', (req, res) => {
    const db = new sqlite3.Database('./Venues.db');
    const query = `SELECT date, venue_pending, reason FROM VenuesPending`;
  
    db.all(query, [], (err, rows) => {
      db.close();
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    });
  });

  
  app.get("/api/final-clubs", (req, res) => {
    const db = new sqlite3.Database("./users.db");
  
    const query = "SELECT DISTINCT club_name FROM users";
  
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error("Error fetching club names:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
  
      res.json(rows); // rows will be like [{ club_name: "Coding" }, { club_name: "Drama" }]
    });
  
    db.close();
  });
  
  app.get("/api/events/:clubName", (req, res) => {
    const clubName = req.params.clubName; // Example: "sangam"
    const dbPath = path.join(__dirname, "events.db"); // Use your central events.db path
  
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error("Failed to open DB:", err.message);
        return res.status(500).json({ error: "Could not open database." });
      }
  
      const query = `SELECT * FROM events WHERE clubName = ?`;
  
      db.all(query, [clubName], (err, rows) => {
        if (err) {
          console.error("Error fetching events:", err.message);
          res.status(500).json({ error: "Error fetching events." });
        } else {
          res.json(rows); // Sends only the matched events
        }
        db.close();
      });
    });
  });

  app.post("/api/submit-final-event", (req, res) => {
    const {
      present_date,
      event_name,
      club_name,
      date_allotted,
      venue_allotted,
      time_from,
      time_to,
      student_coord1,
      phone1,
      student_coord2,
      phone2,
      club_mail,
      reg_fee,
      approved_by,
      date_of_approval,
      comments
    } = req.body;
  
    // === 1. Insert into Final_Events.db ===
    const finalDbPath = path.join(__dirname, "Final_Events.db");
    const finalDb = new sqlite3.Database(finalDbPath, sqlite3.OPEN_READWRITE, (err) => {
      if (err) {
        console.error("Final_Events DB open error:", err.message);
        return res.status(500).json({ error: "Final Events DB open failed." });
      }
  
      const sql = `
        INSERT INTO final_events (
          present_date, event_name, club_name, date_allotted, venue_allotted,
          time_from, time_to, student_coord1, phone1, student_coord2, phone2,
          club_mail, reg_fee, approved_by, date_of_approval, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
  
      finalDb.run(sql, [
        present_date,
        event_name,
        club_name,
        date_allotted,
        venue_allotted,
        time_from,
        time_to,
        student_coord1,
        phone1,
        student_coord2,
        phone2,
        club_mail,
        reg_fee,
        approved_by,
        date_of_approval,
        comments
      ], function (err) {
        finalDb.close();
  
        if (err) {
          console.error("Insert error in Final_Events:", err.message);
          return res.status(500).json({ error: "Insert into Final Events failed." });
        }
  
        // === 2. If venue_allotted exists, update Venues.db ===
        if (venue_allotted) {
          const venueDbPath = path.join(__dirname, "Venues.db");
          const venueDb = new sqlite3.Database(venueDbPath, sqlite3.OPEN_READWRITE, (err) => {
            if (err) {
              console.error("Venues DB open error:", err.message);
              return res.status(500).json({ error: "Venues DB open failed." });
            }
  
            venueDb.serialize(() => {
              // Delete from VenuesPending
              const deleteQuery = `DELETE FROM VenuesPending WHERE venue_pending = ?`;
              venueDb.run(deleteQuery, [venue_allotted], function (err) {
                if (err) {
                  console.error("Error deleting from VenuesPending:", err.message);
                } else {
                  console.log(`Deleted ${this.changes} row(s) from VenuesPending`);
                }
              });
  
              // Insert into VenueAllotted
              const insertVenueQuery = `
                INSERT INTO VenuesAlloted (
                  date, event_name, club_name, venue_alloted, time_from, time_to
                ) VALUES (?, ?, ?, ?, ?, ?)
              `;
  
              venueDb.run(insertVenueQuery, [
                date_allotted,
                event_name,
                club_name,
                venue_allotted,
                time_from,
                time_to
              ], function (err) {
                if (err) {
                  console.error("Error inserting into VenueAllotted:", err.message);
                } else {
                  console.log("Venue successfully allotted.");
                }
              });
            });
  
            venueDb.close();
          });
        }
  
        res.json({ message: "Event submitted and venue updated successfully!" });
      });
    });
  });

  app.get("/api/final-events", (req, res) => {
    const dbPath = path.join(__dirname, "Final_Events.db");
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) {
        console.error("Failed to open DB:", err.message);
        return res.status(500).json({ error: "Could not open database." });
      }
  
      db.all(`SELECT * FROM final_events`, (err, rows) => {
        if (err) {
          console.error("Error fetching final_events:", err.message);
          res.status(500).json({ error: "Error fetching final events." });
        } else {
          res.json(rows);
        }
        db.close();
      });
    });
  });
  
app.get("/get-events", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "events.db"), (err) => {
      if (err) {
        console.error("Failed to connect to database:", err.message);
      } else {
        console.log("Connected to events.db successfully.");
      }
    });
    db.all("SELECT * FROM events", (err, rows) => {
      if (err) {
        console.error("Error fetching events:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // POST Route to update events
  app.post("/update-events", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "events.db"), (err) => {
      if (err) {
        console.error("Failed to connect to database:", err.message);
      } else {
        console.log("Connected to events.db successfully.");
      }
    });
    const events = req.body.events;
  
    db.serialize(() => {
      // Clear all rows from the table but keep ID field
      db.run("DELETE FROM events", (err) => {
        if (err) {
          console.error("Error deleting rows:", err.message);
          return res.status(500).json({ error: "Failed to clear table." });
        }
  
        const stmt = db.prepare(`
          INSERT INTO events (
            eventName, clubName, date1, date2,
            venue1, venue2, venue3, timeFrom, timeTo,
            eventDescription, studentCoord1, phone1,
            studentCoord2, phone2, facultyCoord,
            clubEmail, fee
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
  
        for (const row of events) {
          const values = [
            row.eventName, row.clubName, row.date1, row.date2,
            row.venue1, row.venue2, row.venue3, row.timeFrom, row.timeTo,
            row.eventDescription, row.studentCoord1, row.phone1,
            row.studentCoord2, row.phone2, row.facultyCoord,
            row.clubEmail, row.fee
          ];
  
          stmt.run(values, (err) => {
            if (err) {
              console.error("Insert error:", err.message);
              // Make sure to finalize the statement even in case of an error
              stmt.finalize();
              return res.status(500).json({ error: "Failed to insert event." });
            }
          });
        }
  
        // Finalize the prepared statement after all rows are inserted
        stmt.finalize((err) => {
          if (err) {
            console.error("Statement finalization error:", err.message);
            return res.status(500).json({ error: "Failed to update table." });
          }
          res.json({ message: "Events table updated successfully." });
        });
      });
    });
  });
  
  
  app.get("/get-uds", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "uds.db"), (err) => {
      if (err) {
        console.error("Failed to connect to uds.db:", err.message);
      } else {
        console.log("Connected to uds.db successfully.");
      }
    });
    db.all("SELECT * FROM uds", (err, rows) => {
      if (err) {
        console.error("Failed to fetch UDS rows:", err.message);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });
  
  // POST: Replace all UDS entries
  app.post("/update-uds", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "uds.db"), (err) => {
      if (err) {
        console.error("Failed to connect to uds.db:", err.message);
      } else {
        console.log("Connected to uds.db successfully.");
      }
    });
    const udsEntries = req.body.uds;
  
    // Validate that udsEntries is an array
    if (!Array.isArray(udsEntries)) {
      return res.status(400).json({ error: "Invalid data format." });
    }
  
    db.serialize(() => {
      
      db.run("DELETE FROM uds", (err) => {
        
        if (err) {
          console.error("Failed to clear UDS table:", err.message);
          return res.status(500).json({ error: "Failed to clear UDS table." });
        }
  
        const stmt = db.prepare(`
          INSERT INTO uds (
            clubName, event_date, event_name,
            requirement_name, quantity
          ) VALUES (?, ?, ?, ?, ?)
        `);
  
        let errorOccurred = false;
  
        for (const row of udsEntries) {
          const values = [
            row.clubName,
            row.event_date,
            row.event_name,
            row.requirement_name,
            row.quantity
          ];
  
          // Validate required fields
          if (values.some(v => v === undefined)) {
            errorOccurred = true;
            console.error("Missing field in row:", row);
            continue;
          }
  
          stmt.run(values, (err) => {
            if (err) {
              errorOccurred = true;
              console.error("Insert error in UDS:", err.message);
            }
          });
        }
  
        stmt.finalize((err) => {
          if (err || errorOccurred) {
            console.error("Finalizing error or insert errors occurred.");
            return res.status(500).json({ error: "Some rows may have failed to insert." });
          }
  
          res.json({ message: "UDS table updated successfully." });
        });
      });
    });
  });
  
  // Close DB when process exits
  
  app.get("/get-posters", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "posters.db"), (err) => {
      if (err) {
        console.error("Failed to connect to posters.db:", err.message);
        return res.status(500).json({ error: "Database connection failed." });
      }
  
      db.all("SELECT * FROM posters", (err, rows) => {
        if (err) {
          console.error("Failed to fetch posters:", err.message);
          return res.status(500).json({ error: err.message });
        }
  
        res.json(rows);
        db.close();
      });
    });
  });
  
  // POST: Update posters table
  app.post("/update-posters", (req, res) => {
    const db = new sqlite3.Database(path.join(__dirname, "posters.db"), (err) => {
      if (err) {
        console.error("Failed to connect to posters.db:", err.message);
        return res.status(500).json({ error: "Database connection failed." });
      }
    });
  
    const posters = req.body.posters;
  
    if (!Array.isArray(posters)) {
      return res.status(400).json({ error: "Invalid posters data." });
    }
  
    db.serialize(() => {
      db.run("DELETE FROM posters", (err) => {
        if (err) {
          console.error("Failed to delete existing posters:", err.message);
          return res.status(500).json({ error: "Failed to clear posters table." });
        }
  
        const stmt = db.prepare(`
          INSERT INTO posters (
            clubName, event_date, event_name, drive_link, upload_on
          ) VALUES (?, ?, ?, ?, ?)
        `);
  
        for (const row of posters) {
          const values = [
            row.clubName,
            row.event_date,
            row.event_name,
            row.drive_link,
            row.upload_on || null
          ];
  
          stmt.run(values, (err) => {
            if (err) {
              console.error("Insert error in posters:", err.message);
            }
          });
        }
  
        stmt.finalize((err) => {
          if (err) {
            console.error("Finalizing statement error:", err.message);
            return res.status(500).json({ error: "Failed to insert posters." });
          }
  
          res.json({ message: "Posters table updated successfully." });
          db.close();
        });
      });
    });
  });
  
  // GET: Fetch all purchase list items
app.get("/get-purchaselist", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "purchaselist.db"), (err) => {
    if (err) {
      console.error("Failed to connect to purchaselist.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM purchaselist", (err, rows) => {
      if (err) {
        console.error("Failed to fetch purchase list:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update purchase list items
app.post("/update-purchaselist", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "purchaselist.db"), (err) => {
    if (err) {
      console.error("Failed to connect to purchaselist.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const purchaselist = req.body.purchaselist;

  if (!Array.isArray(purchaselist)) {
    return res.status(400).json({ error: "Invalid purchaselist data." });
  }

  db.serialize(() => {
    db.run("DELETE FROM purchaselist", (err) => {
      if (err) {
        console.error("Failed to clear purchaselist table:", err.message);
        return res.status(500).json({ error: "Failed to clear purchase list." });
      }

      const stmt = db.prepare(`
        INSERT INTO purchaselist (
          clubName, event_date, event_name,
          item_name, quantity, price, source,
          amount, upload_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const row of purchaselist) {
        const values = [
          row.clubName,
          row.event_date,
          row.event_name,
          row.item_name,
          row.quantity,
          row.price,
          row.source,
          row.amount,
          row.upload_time || null
        ];

        stmt.run(values, (err) => {
          if (err) console.error("Insert error in purchaselist:", err.message);
        });
      }

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing insert error:", err.message);
          return res.status(500).json({ error: "Failed to insert purchase list data." });
        }

        res.json({ message: "Purchase list updated successfully." });
        db.close();
      });
    });
  });
});



// Get all housekeeping data from housekeeping.db
// GET: Fetch all housekeeping data
app.get("/get-housekeeping", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "housekeeping.db"), (err) => {
    if (err) {
      console.error("Failed to connect to housekeeping.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM housekeeping", (err, rows) => {
      if (err) {
        console.error("Failed to fetch housekeeping data:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update housekeeping data
app.post("/update-housekeeping", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "housekeeping.db"), (err) => {
    if (err) {
      console.error("Failed to connect to housekeeping.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const housekeeping = req.body.housekeeping;

  if (!Array.isArray(housekeeping)) {
    return res.status(400).json({ error: "Invalid housekeeping data." });
  }

  db.serialize(() => {
    db.run("DELETE FROM housekeeping", (err) => {
      if (err) {
        console.error("Failed to clear housekeeping table:", err.message);
        return res.status(500).json({ error: "Failed to clear housekeeping table." });
      }

      const stmt = db.prepare(`
        INSERT INTO housekeeping (
          clubName, event_date, event_name,
          requirement_name, quantity
        ) VALUES (?, ?, ?, ?, ?)
      `);

      for (const row of housekeeping) {
        const values = [
          row.clubName,
          row.event_date,
          row.event_name,
          row.requirement_name,
          row.quantity
        ];

        stmt.run(values, (err) => {
          if (err) console.error("Insert error in housekeeping:", err.message);
        });
      }

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing error:", err.message);
          return res.status(500).json({ error: "Failed to finalize insert." });
        }

        res.json({ message: "Housekeeping table updated successfully." });
        db.close();
      });
    });
  });
});


// GET: Fetch all WiFi details
app.get("/get-wifi", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "wifi.db"), (err) => {
    if (err) {
      console.error("Failed to connect to wifi.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM wifi", (err, rows) => {
      if (err) {
        console.error("Failed to fetch wifi data:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update WiFi details
app.post("/update-wifi", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "wifi.db"), (err) => {
    if (err) {
      console.error("Failed to connect to wifi.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const wifiDetails = req.body.wifiDetails;

  if (!Array.isArray(wifiDetails)) {
    return res.status(400).json({ error: "Invalid WiFi data format." });
  }

  db.serialize(() => {
    db.run("DELETE FROM wifi", (err) => {
      if (err) {
        console.error("Failed to clear wifi table:", err.message);
        return res.status(500).json({ error: "Failed to clear wifi table." });
      }

      const stmt = db.prepare(`
        INSERT INTO wifi (
          clubName, event_date, event_name,
          requirement_name, quantity
        ) VALUES (?, ?, ?, ?, ?)
      `);

      for (const row of wifiDetails) {
        const values = [
          row.clubName,
          row.event_date,
          row.event_name,
          row.requirement_name,
          row.quantity
        ];

        stmt.run(values, (err) => {
          if (err) console.error("Insert error in wifi:", err.message);
        });
      }

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing error:", err.message);
          return res.status(500).json({ error: "Failed to finalize insert." });
        }

        res.json({ message: "WiFi details updated successfully." });
        db.close();
      });
    });
  });
});


// GET: Fetch all sponsors
app.get("/get-sponsors", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "sponsors.db"), (err) => {
    if (err) {
      console.error("Failed to connect to sponsors.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM sponsors", (err, rows) => {
      if (err) {
        console.error("Failed to fetch sponsors data:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update sponsors data
app.post("/update-sponsors", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "sponsors.db"), (err) => {
    if (err) {
      console.error("Failed to connect to sponsors.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const sponsorsDetails = req.body.sponsorsDetails;

  if (!Array.isArray(sponsorsDetails)) {
    return res.status(400).json({ error: "Invalid sponsors data format." });
  }

  db.serialize(() => {
    db.run("DELETE FROM sponsors", (err) => {
      if (err) {
        console.error("Failed to clear sponsors table:", err.message);
        return res.status(500).json({ error: "Failed to clear sponsors table." });
      }

      const stmt = db.prepare(`
        INSERT INTO sponsors (
          clubName, event_date, event_name, sponsor_name, amount, status
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const row of sponsorsDetails) {
        const values = [
          row.clubName,
          row.event_date,
          row.event_name,
          row.sponsor_name,
          row.amount,
          row.status
        ];

        stmt.run(values, (err) => {
          if (err) console.error("Insert error in sponsors:", err.message);
        });
      }

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing error:", err.message);
          return res.status(500).json({ error: "Failed to finalize insert." });
        }

        res.json({ message: "Sponsors details updated successfully." });
        db.close();
      });
    });
  });
});


// GET: Fetch all organizers
app.get("/get-organizers", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, 'organizers.db'), (err) => {
    if (err) {
      console.error('Failed to connect to organizers.db:', err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM organizers", (err, rows) => {
      if (err) {
        console.error("Error fetching organizers:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update organizers
app.post("/update-organizers", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, 'organizers.db'), (err) => {
    if (err) {
      console.error('Failed to connect to organizers.db:', err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const organizers = req.body.organizers;

  if (!Array.isArray(organizers)) {
    return res.status(400).json({ error: "Invalid organizers data format." });
  }

  db.serialize(() => {
    db.run("DELETE FROM organizers", (err) => {
      if (err) {
        console.error("Failed to clear organizers table:", err.message);
        return res.status(500).json({ error: "Failed to clear table." });
      }

      const stmt = db.prepare(`
        INSERT INTO organizers (identity, id, password)
        VALUES (?, ?, ?)
      `);

      for (const row of organizers) {
        const values = [row.identity, row.id, row.password];
        stmt.run(values, (err) => {
          if (err) console.error("Insert error:", err.message);
        });
      }

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing error:", err.message);
          return res.status(500).json({ error: "Insert finalization failed." });
        }

        res.json({ message: "Organizers table updated successfully." });
        db.close();
      });
    });
  });
});


// GET: Fetch final events
// GET: Fetch final events
app.get("/get-final-events", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Final_Events.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Final_Events.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }

    db.all("SELECT * FROM final_events", (err, rows) => {
      if (err) {
        console.error("Failed to fetch final events:", err.message);
        return res.status(500).json({ error: err.message });
      }

      res.json(rows);
      db.close();
    });
  });
});

// POST: Update final events
app.post("/update-final-events", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Final_Events.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Final_Events.db:", err.message);
      return res.status(500).json({ error: "Database connection failed." });
    }
  });

  const events = req.body.events;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: "Invalid data format. Expected an array." });
  }

  db.serialize(() => {
    db.run("DELETE FROM final_events", (err) => {
      if (err) {
        console.error("Error clearing table:", err.message);
        return res.status(500).json({ error: "Failed to clear final_events table." });
      }

      const stmt = db.prepare(`
        INSERT INTO final_events (
          present_date, event_name, club_name, date_allotted,
          venue_allotted, time_from, time_to,
          student_coord1, phone1, student_coord2, phone2,
          club_mail, reg_fee, approved_by, date_of_approval, comments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      events.forEach((row) => {
        const values = [
          row.present_date, row.event_name, row.club_name, row.date_allotted,
          row.venue_allotted, row.time_from, row.time_to,
          row.student_coord1, row.phone1, row.student_coord2, row.phone2,
          row.club_mail, row.reg_fee, row.approved_by, row.date_of_approval, row.comments
        ];
        stmt.run(values, (err) => {
          if (err) console.error("Insert error:", err.message);
        });
      });

      stmt.finalize((err) => {
        if (err) {
          console.error("Statement finalize error:", err.message);
          return res.status(500).json({ error: "Insert finalization failed." });
        }

        res.json({ message: "Final Events table updated successfully." });
        db.close();
      });
    });
  });
});



// GET: Retrieve all users
app.get("/get-users", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "database", "users.db"));
  
  db.all("SELECT * FROM users", (err, rows) => {
    db.close();
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows || []);
  });
});

// Update users
app.post("/update-users", (req, res) => {
  const { users } = req.body;
  const db = new sqlite3.Database(path.join(__dirname, "database", "users.db"));

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    db.run("DELETE FROM users", (err) => {
      if (err) {
        db.run("ROLLBACK");
        db.close();
        return res.status(500).json({ error: err.message });
      }

      const stmt = db.prepare("INSERT INTO users (club_name, club_email, password) VALUES (?, ?, ?)");
      
      users.forEach(user => {
        stmt.run([user.club_name, user.club_email, user.password]);
      });

      stmt.finalize((err) => {
        if (err) {
          db.run("ROLLBACK");
          db.close();
          return res.status(500).json({ error: err.message });
        }

        db.run("COMMIT", (err) => {
          db.close();
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ message: "Users updated successfully" });
        });
      });
    });
  });
});

// POST route to update Allotted Venues data
app.post("/update-allotted-venues", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), err => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
    } else {
      console.log("Connected to Venues.db successfully.");
    }
  });

  const venues = req.body.events;

  db.serialize(() => {
    db.run("DELETE FROM VenuesAlloted");

    const stmt = db.prepare(`
      INSERT INTO VenuesAlloted (date, event_name, club_name, venue_alloted, time_from, time_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const venue of venues) {
      stmt.run([venue.date, venue.event_name, venue.club_name, venue.venue_alloted, venue.time_from, venue.time_to]);
    }

    stmt.finalize();
    res.json({ message: "Allotted Venues updated successfully." });
  });
});




// Fetch All Venues data
app.get("/get-all-venues", (req, res) => {
  console.log("GET /get-all-venues called");

  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
      return res.status(500).json({ error: err.message });
    }

    db.all("SELECT * FROM AllVenues", (err, rows) => {
      if (err) {
        console.error("Failed to fetch data:", err.message);
        return res.status(500).json({ error: err.message });
      }
      console.log("Fetched rows:", rows);
      res.json(rows);
    });
  });
});


// Update All Venues data (except id)
app.get("/get-all-venues", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Connection failed:", err.message);
      return res.status(500).json({ error: "Failed to connect to database." });
    }
  });

  db.all("SELECT * FROM AllVenues", (err, rows) => {
    if (err) {
      console.error("Query failed:", err.message);
      return res.status(500).json({ error: err.message });
    }

    res.json(rows);
    db.close();
  });
});

// POST: Update all venues
app.post("/update-all-venues", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Connection failed:", err.message);
      return res.status(500).json({ error: "Failed to connect to database." });
    }
  });

  const venues = req.body.venues;

  if (!Array.isArray(venues)) {
    return res.status(400).json({ error: "Expected an array of venues." });
  }

  db.serialize(() => {
    db.run("DELETE FROM AllVenues", (err) => {
      if (err) {
        console.error("Failed to clear venues:", err.message);
        return res.status(500).json({ error: "Could not clear venues." });
      }

      const stmt = db.prepare("INSERT INTO AllVenues (venue_name) VALUES (?)");

      venues.forEach((venue) => {
        // Skip empty rows
        if (!venue.venue_name || venue.venue_name.trim() === "") return;

        stmt.run([venue.venue_name], (err) => {
          if (err) console.error("Insert failed:", err.message);
        });
      });

      stmt.finalize((err) => {
        if (err) {
          console.error("Finalizing failed:", err.message);
          return res.status(500).json({ error: "Failed to save venues." });
        }

        res.json({ message: "All venues updated successfully." });
        db.close();
      });
    });
  });
});

app.get("/get-venues-allotted", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  db.all("SELECT * FROM VenuesAlloted", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
    db.close(); // Close the database connection
  });
});

// POST: Update Venues Allotted data
app.post("/update-venues-allotted", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  const venues = req.body.venues; // Modified venue data

  // Validate if the provided data is an array
  if (!Array.isArray(venues) || venues.length === 0) {
    return res.status(400).json({ error: "Invalid data format or empty venues array." });
  }

  db.serialize(() => {
    // Clear all existing records (except the id)
    db.run("DELETE FROM VenuesAlloted");

    const stmt = db.prepare(`
      INSERT INTO VenuesAlloted (date, event_name, club_name, venue_alloted, time_from, time_to)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Insert all the updated venue data
    venues.forEach(venue => {
      stmt.run([venue.date, venue.event_name, venue.club_name, venue.venue_alloted, venue.time_from, venue.time_to]);
    });

    stmt.finalize((err) => {
      if (err) {
        console.error("Failed to update VenuesAlloted:", err.message);
        return res.status(500).json({ error: "Failed to update VenuesAlloted." });
      }
      res.json({ message: "VenuesAlloted data updated successfully." });
      db.close(); // Close the database connection
    });
  });
});

app.get("/get-venues-pending", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  db.all("SELECT * FROM VenuesPending", (err, rows) => {
    if (err) {
      console.error("Error fetching data:", err.message);
      return res.status(500).json({ error: err.message });
    }

    // Log rows for debugging
    // console.log("Fetched Venues Pending:", rows);
    res.json(rows);
    db.close(); // Ensure the database connection is closed
  });
});

// POST: Update Venues Pending data
app.post("/update-venues-pending", (req, res) => {
  const db = new sqlite3.Database(path.join(__dirname, "Venues.db"), (err) => {
    if (err) {
      console.error("Failed to connect to Venues.db:", err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  const venues = req.body.venues; // Modified venue data

  // Validate input data
  if (!Array.isArray(venues) || venues.length === 0) {
    return res.status(400).json({ error: "Invalid data format or empty venues array." });
  }

  db.serialize(() => {
    db.run("DELETE FROM VenuesPending"); // Delete all existing data (except id)

    const stmt = db.prepare(`
      INSERT INTO VenuesPending (date, venue_pending, reason)
      VALUES (?, ?, ?)
    `);

    // Insert all the updated venue data
    venues.forEach(venue => {
      // Ensure venue data is valid before inserting
      if (venue.date && venue.venue_pending && venue.reason) {
        stmt.run([venue.date, venue.venue_pending, venue.reason]);
      } else {
        console.warn("Skipping invalid venue data:", venue);
      }
    });

    stmt.finalize((err) => {
      if (err) {
        console.error("Failed to update VenuesPending:", err.message);
        return res.status(500).json({ error: "Failed to update VenuesPending." });
      }

      console.log("VenuesPending data updated successfully.");
      res.json({ message: "VenuesPending data updated successfully." });
      db.close(); // Close the database connection
    });
  });
});


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
