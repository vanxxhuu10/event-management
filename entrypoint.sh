#!/bin/bash

echo "🔄 Restoring databases with Litestream..."
litestream restore -if-db-not-exists /app/users.db
litestream restore -if-db-not-exists /app/events.db
litestream restore -if-db-not-exists /app/uds.db
litestream restore -if-db-not-exists /app/housekeeping.db
litestream restore -if-db-not-exists /app/organizers.db
litestream restore -if-db-not-exists /app/Venues.db
litestream restore -if-db-not-exists /app/Final_Events.db
litestream restore -if-db-not-exists /app/posters.db
litestream restore -if-db-not-exists /app/sponsors.db
litestream restore -if-db-not-exists /app/purchaselist.db
litestream restore -if-db-not-exists /app/wifi.db

echo "✅ Starting Litestream background sync..."
litestream replicate -config /app/litestream.yml &

echo "🚀 Starting your Node.js app..."
node index.js
