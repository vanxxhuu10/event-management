const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database/db');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/pictures', express.static(path.join(__dirname, 'pictures')));

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
  const db = new sqlite3.Database('./database/users.db', (err) => {
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
    const dbPath = path.join(__dirname, 'database', 'users.db');
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
    const db = new sqlite3.Database("./database/users.db");
  
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
  


app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
