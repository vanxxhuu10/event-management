function filterVenues(type) {
    const venueListContainer = document.getElementById('venueList');
    venueListContainer.innerHTML = '<p>Loading...</p>';
  
    let url = '';
    if (type === 'all') url = 'https://event-management-divk.onrender.com/api/all-venues';
    else if (type === 'allotted') url = 'https://event-management-divk.onrender.com/api/allotted-venues';
    else if (type === 'nonallotted') url = 'https://event-management-divk.onrender.com/api/nonallotted-venues';
  
    fetch(url)
      .then(res => res.json())
      .then(data => {
        let tableHTML = '';
        venueListContainer.innerHTML = ''; // Clear previous content
  
        if (type === 'all') {
          tableHTML += `
            <h2>All Venues</h2>
            <table>
              <thead>
                <tr><th>Venue Name</th></tr>
              </thead>
              <tbody>
          `;
          data.forEach(item => {
            tableHTML += `<tr><td>${item.venue_name}</td></tr>`;
          });
          tableHTML += '</tbody></table>';
        }
  
        else if (type === 'allotted') {
          tableHTML += `
            <h2>Allotted Venues</h2>
            <table>
              <thead>
                <tr>
                  <th>Venue Allotted</th>
                  <th>Event Name</th>
                  <th>Club Name</th>
                  <th>Date</th>
                  <th>Time From</th>
                  <th>Time To</th>
                </tr>
              </thead>
              <tbody>
          `;
          data.forEach(item => {
            tableHTML += `
              <tr>
                <td>${item.venue_alloted}</td>
                <td>${item.event_name}</td>
                <td>${item.club_name}</td>
                <td>${item.date}</td>
                <td>${item.time_from}</td>
                <td>${item.time_to}</td>
              </tr>
            `;
          });
          tableHTML += '</tbody></table>';
        }
  
        else if (type === 'nonallotted') {
          tableHTML += `
            <h2>Non-Allotted Venues</h2>
            <table>
              <thead>
                <tr>
                  <th>Venue Pending</th>
                  <th>Date</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
          `;
          data.forEach(item => {
            tableHTML += `
              <tr>
                <td>${item.venue_pending}</td>
                <td>${item.date}</td>
                <td>${item.reason}</td>
              </tr>
            `;
          });
          tableHTML += '</tbody></table>';
        }
  
        venueListContainer.innerHTML = tableHTML;
      })
      .catch(err => {
        console.error('Error fetching venue data:', err);
        venueListContainer.innerHTML = '<p>Error loading venues. Please try again later.</p>';
      });
  }
  
