// Extract event and club info from localStorage
document.addEventListener('DOMContentLoaded', () => {
  const eventName = localStorage.getItem('selectedEventName');
  const clubName = localStorage.getItem('selectedClubName');

  if (!eventName || !clubName) {
    document.getElementById('eventTitle').textContent = "Event Not Found";
    document.getElementById('clubName').textContent = "Please return to the previous page.";
    return;
  }

  document.getElementById('eventTitle').textContent = eventName;
  document.getElementById('clubName').textContent = clubName;
});

function navigateTo(section) {
  alert(`Navigating to ${section} section... (This should link to actual page or scroll)`);
  // You can update this to redirect to actual section/page when available
}

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    club: params.get('club') || localStorage.getItem('selectedClubName') || 'Unknown Club',
    event: params.get('event') || localStorage.getItem('selectedEventName') || 'Unknown Event',
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const { club, event } = getQueryParams();

  // Display club and event names
  document.getElementById('eventTitle').textContent = decodeURIComponent(event);
  document.getElementById('clubName').textContent = `Organized by: ${decodeURIComponent(club)}`;

  // Optionally load a default section
  showSection('requirements');
});

function navigateTo(section, btn = null) {
  showSection(section);

  // Highlight active button
  const buttons = document.querySelectorAll('.button-group button');
  buttons.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

// Load section content
function showSection(section) {
  const content = document.getElementById('detailsContent');
  const { club, event } = getQueryParams(); // Extract club and event

  if (section === 'requirements') {
    fetch(`https://event-management-divk.onrender.com/api/requirements/${club}?event=${encodeURIComponent(event)}`)
      .then(response => response.json())
      .then(data => {
        content.innerHTML = `
          <div class="card">
            <h3>UDS</h3>
            ${generateTableHTML(data.uds)}
          </div>
          <div class="card">
            <h3>House Keeping</h3>
            ${generateTableHTML(data.housekeeping)}
          </div>
          <div class="card">
            <h3>WiFi</h3>
            ${generateTableHTML(data.wifi)}
          </div>
        `;
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Error loading data: ${err.message}</p>`;
      });
  } else if (section === 'posters') {
    // Fetch posters for the event
    fetch(`https://event-management-divk.onrender.com/api/posters/${club}?event=${encodeURIComponent(event)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          content.innerHTML = `<p style="color:red;">${data.error}</p>`;
        } else {
          content.innerHTML = `
            <div class="card">
              <h3>Posters for ${event}</h3>
              ${generatePostersHTML(data.posters)}
            </div>
          `;
        }
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Error loading posters: ${err.message}</p>`;
      });
  } else if (section === 'sponsors') {
    fetch(`https://event-management-divk.onrender.com/api/sponsors/${club}?event=${encodeURIComponent(event)}`)
      .then(response => response.json())
      .then(data => {
        content.innerHTML = `
          <h3>Sponsors for ${event}</h3>
          ${generateTableHTML(data.sponsors)}
        `;
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Error loading data: ${err.message}</p>`;
      });
  } else if (section === 'purchase-list') {
    fetch(`https://event-management-divk.onrender.com/api/purchase/${club}?event=${encodeURIComponent(event)}`)
      .then(response => response.json())
      .then(data => {
        content.innerHTML = `
          <h3>Purchase List for ${event}</h3>
          ${generatePurchaseHTML(data.purchase)}
        `;
      })
      .catch(err => {
        content.innerHTML = `<p style="color:red;">Error loading purchase list: ${err.message}</p>`;
      });
  } else {
    content.innerHTML = `<p><strong>${section.toUpperCase()}</strong> content will appear here.</p>`;
  }
}



// Table HTML generator
function generateTableHTML(data) {
  if (!data || data.length === 0) return `<p>No data available.</p>`;

  const keys = Object.keys(data[0]);
  let table = `<table><thead><tr>`;
  keys.forEach(key => {
    table += `<th>${key.toUpperCase()}</th>`;
  });
  table += `</tr></thead><tbody>`;

  data.forEach(row => {
    table += `<tr>`;
    keys.forEach(key => {
      table += `<td>${row[key]}</td>`;
    });
    table += `</tr>`;
  });

  table += `</tbody></table>`;
  return table;
}


// Posters HTML generator
function generatePostersHTML(posters) {
  if (!posters || posters.length === 0) return `<p>No posters available.</p>`;

  let tableHTML = `<table border="1">
    <thead>
      <tr>
        <th>Event Date</th>
        <th>Drive Link</th>
        <th>Uploaded On</th>
      </tr>
    </thead>
    <tbody>`;

  posters.forEach(poster => {
    tableHTML += `
      <tr>
        <td>${poster.event_date}</td>
        <td><a href="${poster.drive_link}" target="_blank">Click here</a></td>
        <td>${poster.upload_on}</td>
      </tr>
    `;
  });

  tableHTML += `</tbody></table>`;
  return tableHTML;
}

function generateSponsorsHTML(data) {
  if (!data || data.length === 0) return `<p>No data available.</p>`;

  const keys = Object.keys(data[0]);
  let table = `<table><thead><tr>`;

  // Create table headers
  keys.forEach(key => {
    table += `<th>${key.toUpperCase()}</th>`;
  });

  table += `</tr></thead><tbody>`;

  // Create table rows
  data.forEach(row => {
    table += `<tr>`;
    keys.forEach(key => {
      table += `<td>${row[key]}</td>`;
    });
    table += `</tr>`;
  });

  table += `</tbody></table>`;
  return table;
}

function generatePurchaseHTML(data) {
  if (!data || data.length === 0) return `<p>No purchase records available.</p>`;

  let table = `
    <table>
      <thead>
        <tr>
          <th>Event Date</th>
          <th>Item Name</th>
          <th>Quantity</th>
          <th>Price (₹)</th>
          <th>Source</th>
          <th>Total Amount (₹)</th>
          <th>Upload Time</th>
        </tr>
      </thead>
      <tbody>
  `;

  let total = 0;

  data.forEach(row => {
    total += parseFloat(row.amount);
    table += `
      <tr>
        <td>${row.event_date}</td>
        <td>${row.item_name}</td>
        <td>${row.quantity}</td>
        <td>${row.price}</td>
        <td>${row.source}</td>
        <td>${row.amount}</td>
        <td>${row.upload_time}</td>
      </tr>
    `;
  });

  table += `
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" style="text-align:right;"><strong>Total</strong></td>
          <td colspan="2"><strong>₹ ${total.toFixed(2)}</strong></td>
        </tr>
      </tfoot>
    </table>
  `;

  return table;
}

