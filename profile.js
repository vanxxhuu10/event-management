
document.addEventListener("DOMContentLoaded", () => {
    // Set club name
    document.getElementById("clubName").innerText = 
    sessionStorage.getItem("clubName") || "Club Name";
    const clubName = sessionStorage.getItem("clubName");
    // Fetch and populate event data
    fetch(`/api/events?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("eventBody");
  
        data.forEach(event => {
          const row = document.createElement("tr");
  
          row.innerHTML = `
            <td>${event.eventName}</td>
            <td>${event.date1}</td>
            <td>${event.date2}</td>
            <td>${event.venue1}</td>
            <td>${event.venue2}</td>
            <td>${event.venue3}</td>
            <td>${event.timeFrom}</td>
            <td>${event.timeTo}</td>
            <td>${event.eventDescription}</td>
            <td>${event.studentCoord1}</td>
            <td>${event.phone1}</td>
            <td>${event.studentCoord2 || ''}</td>
            <td>${event.phone2 || ''}</td>
            <td>${event.facultyCoord}</td>
            <td>${event.clubEmail}</td>
            <td>${event.fee}</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
          `;
  
          tbody.appendChild(row);
        });
      });
  
    // Delete row function
    window.deleteRow = function(btn) {
      const row = btn.parentNode.parentNode;
      row.remove();
    };
  
    // Submit button event
    const submitEventBtn = document.getElementById("submitEventsBtn");
    if (submitEventBtn) {
      submitEventBtn.addEventListener("click", () => {
        const rows = document.querySelectorAll("#eventBody tr");
        const eventData = [];
  
        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          eventData.push({
            eventName: cells[0].innerText,
            clubName: clubName,
            date1: cells[1].innerText,
            date2: cells[2].innerText,
            venue1: cells[3].innerText,
            venue2: cells[4].innerText,
            venue3: cells[5].innerText,
            timeFrom: cells[6].innerText,
            timeTo: cells[7].innerText,
            eventDescription: cells[8].innerText,
            studentCoord1: cells[9].innerText,
            phone1: cells[10].innerText,
            studentCoord2: cells[11].innerText,
            phone2: cells[12].innerText,
            facultyCoord: cells[13].innerText,
            clubEmail: cells[14].innerText,
            fee: parseFloat(cells[15].innerText)
          });
        });
  
        fetch('/api/submit-events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ clubName, events: eventData })
        })
        .then(res => res.json())
        .then(response => {
          alert(response.message || "Events updated successfully.");
          window.location.reload();
        })
        .catch(error => {
          console.error('Error submitting events:', error);
          alert("An error occurred while submitting.");
        });
      });
    }
  });
  
document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
  
    // Fetch UDS data and populate the table
    fetch(`/api/uds?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("udsTable");
  
        data.forEach(row => {
          const tr = document.createElement("tr");
  
          tr.innerHTML = `
            <td>${row.event_date}</td>
            <td>${row.event_name}</td>
            <td contenteditable="true">${row.requirement_name}</td>
            <td contenteditable="true">${row.quantity}</td>
            <td><button class="delete-btn" onclick="deleteUDSRow(this)">Delete</button></td>
          `;
  
          tbody.appendChild(tr);
        });
      });
  
    // Delete row function
    window.deleteUDSRow = function(btn) {
      const row = btn.closest("tr");
      row.remove();
    };
  
    // Submit modified UDS data
    const submitUDSBtn = document.querySelector(".submitUDSBtn");
    if (submitUDSBtn) {
      submitUDSBtn.addEventListener("click", () => {
        const rows = document.querySelectorAll("#udsTable tr");
        const udsData = [];
  
        rows.forEach(row => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 4) {
            udsData.push({
              clubName: clubName,
              event_date: cells[0].innerText.trim(),
              event_name: cells[1].innerText.trim(),
              requirement_name: cells[2].innerText.trim(),
              quantity: cells[3].innerText.trim()
            });
          }
        });
  
        fetch('/api/submit-uds', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ clubName, uds: udsData })
        })
        .then(res => res.json())
        .then(response => {
          alert(response.message || "UDS data submitted successfully.");
          window.location.reload();
        })
        .catch(error => {
          console.error('Error submitting UDS data:', error);
          alert("An error occurred while submitting UDS data.");
        });
      });
    }
  });
  
document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
    document.getElementById("clubName").innerText = clubName || "Club Name";
  
    // Fetch Housekeeping Table
    fetch(`/api/housekeeping?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("housekeepingBody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.event_date}</td>
            <td>${item.event_name}</td>
            <td>${item.requirement_name}</td>
            <td contenteditable="true">${item.quantity}</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  
    // Submit Housekeeping Table
    document.querySelector(".submitHousekeepingBtn").addEventListener("click", () => {
      const rows = document.querySelectorAll("#housekeepingBody tr");
      const housekeepingData = [];
  
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        housekeepingData.push({
          event_date: cells[0].innerText,
          event_name: cells[1].innerText,
          requirement_name: cells[2].innerText,
          quantity: cells[3].innerText
        });
      });
  
      fetch("/api/submit-housekeeping", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, items: housekeepingData })
      })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Housekeeping data submitted successfully.");
        window.location.reload();
      })
      .catch(error => {
        console.error("Error submitting housekeeping data:", error);
        alert("An error occurred while submitting.");
      });
      function deleteRow(btn) {
        const row = btn.closest("tr");
        row.remove();
      }
    });
  });
  
document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
    document.getElementById("clubName").innerText = clubName || "Club Name";
  
    // Fetch Wi-Fi Table
    fetch(`/api/wifi?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("wifiBody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td>${item.event_date}</td>
            <td>${item.event_name}</td>
            <td>${item.requirement_name}</td>
            <td contenteditable="true">${item.quantity}</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  
    // Submit Wi-Fi Table
    document.querySelector(".submitWifiBtn").addEventListener("click", () => {
      const rows = document.querySelectorAll("#wifiBody tr");
      const wifiData = [];
  
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        wifiData.push({
          event_date: cells[0].innerText,
          event_name: cells[1].innerText,
          requirement_name: cells[2].innerText,
          quantity: cells[3].innerText
        });
      });
  
      fetch("/api/submit-wifi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, items: wifiData })
      })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Wi-Fi data submitted successfully.");
        window.location.reload();
      })
      .catch(error => {
        console.error("Error submitting wifi data:", error);
        alert("An error occurred while submitting.");
      });
      function deleteRow(btn) {
        const row = btn.closest("tr");
        row.remove();
      }
    });
  });
  
  
  document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
    document.getElementById("clubName").innerText = clubName || "Club Name";
  
    // Fetch Sponsors
    fetch(`/api/sponsors?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("sponsorsBody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td contenteditable="true">${item.event_date || ''}</td>
            <td contenteditable="true">${item.event_name || ''}</td>
            <td contenteditable="true">${item.sponsor_name || ''}</td>
            <td contenteditable="true">${item.amount || ''}</td>
            <td contenteditable="true">${item.status || ''}</td>
            <td>${item.upload_on || ''}</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  
    // Submit Sponsors
    document.querySelector(".submitSponsorsBtn").addEventListener("click", () => {
      const rows = document.querySelectorAll("#sponsorsBody tr");
      const sponsorData = [];
  
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        sponsorData.push({
          event_date: cells[0].innerText,
          event_name: cells[1].innerText,
          sponsor_name: cells[2].innerText,
          amount: parseFloat(cells[3].innerText),
          status: cells[4].innerText
        });
      });
  
      fetch("/api/submit-sponsors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, items: sponsorData })
      })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Sponsors submitted successfully.");
        window.location.reload();
      })
      .catch(error => {
        console.error("Error submitting sponsors:", error);
        alert("Error submitting sponsors.");
      });
      function deleteRow(btn) {
        const row = btn.closest("tr");
        row.remove();
      }
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
    document.getElementById("clubName").innerText = clubName || "Club Name";
  
    // Fetch Posters
    fetch(`/api/posters?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("postersBody");
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td contenteditable="true">${item.event_date || ''}</td>
            <td contenteditable="true">${item.event_name || ''}</td>
            <td contenteditable="true">${item.drive_link || ''}</td>
            <td>${item.upload_on || ''}</td>
            <td><button class="delete-btn" onclick="deleteRow(this)">Delete</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  
    // Submit Posters
    document.querySelector(".submitPostersBtn").addEventListener("click", () => {
      const rows = document.querySelectorAll("#postersBody tr");
      const posterData = [];
  
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        posterData.push({
          event_date: cells[0].innerText,
          event_name: cells[1].innerText,
          drive_link: cells[2].innerText
        });
      });
  
      fetch("/api/submit-posters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, items: posterData })
      })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Posters submitted successfully.");
        window.location.reload();
      })
      .catch(error => {
        console.error("Error submitting posters:", error);
        alert("Error submitting posters.");
      });
      function deleteRow(btn) {
        const row = btn.closest("tr");
        row.remove();
      }
      
    });
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const clubName = sessionStorage.getItem("clubName");
    document.getElementById("clubName").innerText = clubName || "Club Name";
  
    // Fetch Purchase Data
    fetch(`/api/purchases?clubName=${encodeURIComponent(clubName)}`)
      .then(res => res.json())
      .then(data => {
        const tbody = document.getElementById("purchaseBody");
  
        data.forEach(item => {
          const row = document.createElement("tr");
          row.innerHTML = `
            <td contenteditable="true">${item.event_date}</td>
            <td contenteditable="true">${item.event_name}</td>
            <td contenteditable="true">${item.item_name}</td>
            <td contenteditable="true">${item.quantity}</td>
            <td contenteditable="true">${item.price}</td>
            <td contenteditable="true">${item.source}</td>
            <td contenteditable="true">${item.amount}</td>
            <td>${item.upload_time || ''}</td>
            <td><button onclick="deleteRow(this)">Delete</button></td>
          `;
          tbody.appendChild(row);
        });
      });
  
    // Submit Purchases
    document.querySelector(".submitPurchaseBtn").addEventListener("click", () => {
      const rows = document.querySelectorAll("#purchaseBody tr");
      const purchaseData = [];
  
      rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        purchaseData.push({
          event_date: cells[0].innerText,
          event_name: cells[1].innerText,
          item_name: cells[2].innerText,
          quantity: parseInt(cells[3].innerText),
          price: parseFloat(cells[4].innerText),
          source: cells[5].innerText,
          amount: parseFloat(cells[6].innerText),
          upload_time: cells[7].innerText || new Date().toISOString()
        });
      });
  
      fetch("/api/submit-purchases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubName, items: purchaseData })
      })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Purchases submitted successfully.");
        window.location.reload();
      })
      .catch(err => {
        console.error("Error submitting purchases:", err);
        alert("An error occurred while submitting.");
      });
      function deleteRow(btn) {
        btn.closest("tr").remove();
      }
    });
  });
  
  
    
   
  
  