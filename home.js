
window.onload = function () {
    const clubName = sessionStorage.getItem('clubName') || 'Club';
    const clubNameDisplay = document.getElementById('clubNameDisplay');
  
    if (clubNameDisplay) {
      clubNameDisplay.textContent = clubName;
    }
  };
  

function toggleSidebar() {
    let sidebar = document.getElementById('sidebar');
    if (sidebar.style.left === "0px") {
        sidebar.style.left = "-250px";
        sidebar.style.opacity = "0";
    } else {
        sidebar.style.left = "0px";
        sidebar.style.opacity = "1";
    }
}

function showForm() {
    document.getElementById('eventForm').style.display = 'block';
    document.getElementById('venueList').style.display = 'none';
}

function showVenueList() {
    document.getElementById('venueList').style.display = 'block';
    document.getElementById('eventForm').style.display = 'none';
}

let selectedVenues = [];
let venuePreferences = [1, 2, 3];

function selectVenue(preference, venueName) {
    let checkbox = document.getElementById(`venue${preference}Choice`);

    if (selectedVenues.includes(venueName)) {
        selectedVenues = selectedVenues.filter(item => item !== venueName); // Remove venue
    } else if (selectedVenues.length < 3) {
        selectedVenues.push(venueName);
    } else {
        alert("You can only select a maximum of 3 venues.");
        checkbox.checked = false; // Uncheck the checkbox
        return;
    }

    // Update venue preferences
    updateVenuePreferences();
}

function updateVenuePreferences() {
    venuePreferences.forEach((preference, index) => {
        const venueInput = document.getElementById(`venue${preference}`);
        if (selectedVenues[index]) {
            venueInput.value = selectedVenues[index];
        } else {
            venueInput.value = "Please see the available Venues and select them";
        }
    });
}
document.getElementById("eventForm").addEventListener("submit", function(event) {
            event.preventDefault();
            
            let form = document.getElementById("eventForm");
            let successMessage = document.getElementById("successMessage");
            
            form.classList.add("fade-out");
            
            setTimeout(() => {
                form.style.display = "none";
                successMessage.style.display = "block";
            }, 500);
        });
        document.addEventListener('click', () => {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.location.href = 'login.html';
            });
        } else {
            console.error('Logout button not found.');
        }
    });
    document.getElementById('event').addEventListener('submit', async function (e) {
        e.preventDefault(); // Stop default form action
    
        // Collect form data
        const formData = {
            eventName: document.getElementById('eventName').value,
            clubName: document.getElementById('clubName').value,
            date1: document.getElementById('date1').value,
            date2: document.getElementById('date2').value,
            venue1: document.getElementById('venue1').value,
            venue2: document.getElementById('venue2').value,
            venue3: document.getElementById('venue3').value,
            timeFrom: document.getElementById('timeFrom').value,
            timeTo: document.getElementById('timeTo').value,
            eventDescription: document.getElementById('eventDescription').value,
            studentCoord1: document.getElementById('studentCoord1').value,
            phone1: document.getElementById('phone1').value,
            studentCoord2: document.getElementById('studentCoord2').value,
            phone2: document.getElementById('phone2').value,
            facultyCoord: document.getElementById('facultyCoord').value,
            clubEmail: document.getElementById('clubEmail').value,
            fee: parseFloat(document.getElementById('fee').value)
        };
    
        // Log what is being sent
        console.log("📦 Form data being sent:", formData);
    
        try {
            const response = await fetch('/register-event', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
    
            // Attempt to parse JSON response
            const result = await response.json();
            console.log("✅ Server response:", result);
    
            if (result.success) {
                alert('✅ Event registered successfully!');
                document.getElementById('event').reset(); // Clear the form
            } else {
                alert('❌ ' + result.error);
            }
        } catch (error) {
            console.error('❌ Error submitting event:', error);
            alert('❌ Something went wrong while submitting the form.');
        }
    });

    fetch('http://localhost:3000/api/venues')
  .then(res => res.json())
  .then(venues => {
      const venueListContainer = document.getElementById('venueList');
      venueListContainer.innerHTML = '<h2>Venues Available</h2>';
      
      venues.forEach((venue, index) => {
          const venueDiv = document.createElement('div');
          venueDiv.className = 'venue-item';
          venueDiv.innerHTML = `
              <input type="checkbox" id="venue${index + 1}Choice" onclick="selectVenue(${index + 1}, '${venue.venue_pending}')">
              <h3>${venue.venue_pending}</h3>
              <p><strong>Reason:</strong> ${venue.reason}</p>
          `;
          venueListContainer.appendChild(venueDiv);
      });
  })
  .catch(err => console.error('Error fetching venue list:', err));



    
    
    
    
     
        