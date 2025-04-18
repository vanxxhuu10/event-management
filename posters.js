document.getElementById('posterForm').addEventListener('submit', async function (e) {
    e.preventDefault();
  
    const date = document.getElementById('event_date').value;  // Event date from form
    const eventName = document.getElementById('event_name').value;  // Event name from form
    const driveLink = document.getElementById('drive_link').value;  // Google Drive link from form
    const clubName = sessionStorage.getItem('clubName');  // Get club name from session storage

    if (!clubName) {
        alert("Club name not found in session storage.");
        return;
    }

    const currentTime = new Date().toISOString(); // Get current time in ISO format (YYYY-MM-DDTHH:MM:SSZ)
    
    const payload = { eventDate: date, eventName: eventName, driveLink: driveLink, clubName: clubName, currentTime: currentTime };

    try {
        const res = await fetch('https://event-management-divk.onrender.com/submit-poster', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("Failed to save poster.");

        // Insert new poster into the table on the frontend (without reloading the page)
        const table = document.getElementById('posterTable').querySelector('tbody');
        const row = table.insertRow(0);
        
        row.innerHTML = `
            <td>${date}</td>
            <td>${eventName}</td>
            <td><a href="${driveLink}" target="_blank">View Poster</a></td>
            <td><button class="btn btn-danger btn-sm delete-btn">Delete</button></td>
        `;
        
        row.querySelector('.delete-btn').addEventListener('click', () => {
            row.remove();
            // Optionally send DELETE request to backend if needed
        });

        this.reset();
    } catch (error) {
        console.error("Poster upload failed:", error.message);
        alert("Failed to upload poster.");
    }
});


