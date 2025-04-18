document.addEventListener('DOMContentLoaded', async () => {
    try {
      const response = await fetch('https://event-management-divk.onrender.com/clubs');
      if (!response.ok) throw new Error('Network response was not ok');
  
      const clubs = await response.json();
      displayClubs(clubs);
    } catch (error) {
      console.error('Error fetching clubs:', error);
      document.getElementById('clubsContainer').innerHTML = `
        <div class="error" style="text-align:center; color:#e74c3c; grid-column:1/-1">
          Failed to load clubs. Please try again later.
        </div>
      `;
    }
  });
  
  function displayClubs(clubs) {
    const container = document.getElementById('clubsContainer');
    container.innerHTML = '';
  
    clubs.forEach(club => {
      const button = document.createElement('button');
      button.textContent = club.club_name;
      button.className = 'club-button';
      button.onclick = () => fetchAndDisplayEvents(club.club_name);
      container.appendChild(button);
    });
  }
  
  async function fetchAndDisplayEvents(clubName) {
    try {
      const response = await fetch(`https://event-management-divk.onrender.com/events/${encodeURIComponent(clubName)}`);
      if (!response.ok) throw new Error('Failed to fetch events');
  
      const events = await response.json();
      renderEventsTable(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      document.getElementById('eventsTableContainer').innerHTML = `
        <div style="color:red; text-align:center;">Failed to load events for ${clubName}</div>
      `;
    }
  }
  
  function renderEventsTable(events) {
    const container = document.getElementById('eventsTableContainer');
    container.innerHTML = '';
  
    if (!events.length) {
      container.innerHTML = `<p style="text-align:center;">No events available.</p>`;
      return;
    }
  
    const table = document.createElement('table');
    table.className = 'events-table';
  
    // Table Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
  
    const eventKeys = Object.keys(events[0]);
    eventKeys.forEach(key => {
      const th = document.createElement('th');
      th.textContent = key.toUpperCase().replace(/_/g, ' ');
      headerRow.appendChild(th);
    });
  
    // Extra column for Details button
    const thDetails = document.createElement('th');
    thDetails.textContent = 'DETAILS';
    headerRow.appendChild(thDetails);
    thead.appendChild(headerRow);
    table.appendChild(thead);
  
    // Table Body
    const tbody = document.createElement('tbody');
    events.forEach(event => {
      const row = document.createElement('tr');
  
      // Regular data cells
      eventKeys.forEach(key => {
        const td = document.createElement('td');
        td.textContent = event[key];
        row.appendChild(td);
      });
  
      // Details button cell
      const detailsTd = document.createElement('td');
      const detailsButton = document.createElement('button');
      detailsButton.textContent = 'Details';
      detailsButton.className = 'details-button';
  
      // Assume `event_id` or similar field exists
      const eventId = event.event_id || event.id || event.ID; // fallback check
      detailsButton.onclick = () => {
        const encodedClubName = encodeURIComponent(event.clubName);   // or correct key
        const encodedEventName = encodeURIComponent(event.eventName); // or correct key

      
        // Save to localStorage (optional but good for fallback or next-page usage)
        localStorage.setItem('selectedClubName', event.club_name);
        localStorage.setItem('selectedEventName', event.event_name);
      
        // Redirect using URL parameters
        window.location.href = `event-selected-details.html?club=${encodedClubName}&event=${encodedEventName}`;
      };
      
  
      detailsTd.appendChild(detailsButton);
      row.appendChild(detailsTd);
      tbody.appendChild(row);
    });
  
    table.appendChild(tbody);
    container.appendChild(table);
    
      
    
    
  }
  
  
