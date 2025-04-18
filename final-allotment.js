document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/final-clubs")
      .then(res => res.json())
      .then(data => {
        const container = document.getElementById("clubButtons");
        const uniqueClubs = [...new Set(data.map(item => item.club_name))];
  
        uniqueClubs.forEach(club => {
          const btn = document.createElement("button");
          btn.textContent = club;
          btn.onclick = () => loadClubEvents(club);
          container.appendChild(btn);
        });
      })
      .catch(err => {
        console.error("Error loading clubs:", err);
      });
  });

  function loadClubEvents(clubName) {
    fetch(`/api/events/${clubName}`)
      .then(res => res.json())
      .then(events => {
        const tableContainer = document.getElementById("clubTable");
  
        if (events.length === 0) {
          tableContainer.innerHTML = `<p>No events found for ${clubName}</p>`;
          return;
        }
  
        let tableHTML = `
          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Club Name</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Venue 1</th>
                <th>Venue 2</th>
                <th>Venue 3</th>
                <th>Time From</th>
                <th>Time To</th>
                <th>Event Description</th>
                <th>Student Coord 1</th>
                <th>Phone 1</th>
                <th>Student Coord 2</th>
                <th>Phone 2</th>
                <th>Faculty Coord</th>
                <th>Club Email</th>
                <th>Fee</th>
                <th>Present Date</th>
                <th>Date Allotted</th>
                <th>Venue Allotted</th>
                <th>Time From Allotted</th>
                <th>Time To Allotted</th>
                <th>Approved By</th>
                <th>Date of Approval</th>
                <th>Comments</th>
                <th>Submit</th>
                <th>Send</th>
              </tr>
            </thead>
            <tbody>
        `;
  
        events.forEach(event => {
          tableHTML += `
            <tr>
              <td>${event.eventName}</td>
              <td>${event.clubName}</td>
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
              <td>${event.studentCoord2}</td>
              <td>${event.phone2}</td>
              <td>${event.facultyCoord}</td>
              <td>${event.clubEmail}</td>
              <td>${event.fee}</td>
              <td><input type="date" name="presentDate" /></td>
              <td><input type="date" name="dateAllotted" /></td>
              <td><input type="text" name="venueAllotted" /></td>
              <td><input type="time" name="timeFromAllotted" /></td>
              <td><input type="time" name="timeToAllotted" /></td>
              <td><input type="text" name="approvedBy" /></td>
              <td><input type="date" name="dapprovalDate" /></td>
              <td><textarea name="Comments"></textarea></td>
              <td><button class="submitBtn" onclick="submitRow(event)">Submit</button></td>
              <td><button class="sendBtn">Send</button></td>
            </tr>
          `;
        });
  
        tableHTML += `</tbody></table>`;
        tableContainer.innerHTML = tableHTML;
        document.querySelectorAll(".sendBtn").forEach((btn) => {
          btn.addEventListener("click", (e) => {
            const row = e.target.closest("tr");
            const email = row.children[15].textContent.trim(); // Club Email
            const subject = encodeURIComponent("Event Approval Notification");
            const body = encodeURIComponent(`
        Hello,
        
        Your event "${row.children[0].textContent.trim()}" has been reviewed.
        
        Details:
        - Venue Allotted: ${row.querySelector("input[name='venueAllotted']").value}
        - Time: ${row.querySelector("input[name='timeFromAllotted']").value} to ${row.querySelector("input[name='timeToAllotted']").value}
        - Date: ${row.querySelector("input[name='dateAllotted']").value}
        
        Comments:
        ${row.querySelector("textarea[name='Comments']").value}
        
        Best regards,
        Event Approval Committee
            `);
        
            // Redirect to Gmail with prefilled values
            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`;
            window.open(gmailUrl, "_blank"); // Open in a new tab
          });
        });
      })
      .catch(err => {
        console.error("Error fetching events:", err);
      });
  }
  
  // Add this after rendering the table
  function submitRow(event) {
    const btn = event.target;
    const row = btn.closest("tr");
  
    const data = {
      present_date: row.querySelector("input[name='presentDate']").value,
      event_name: row.children[0].textContent.trim(),
      club_name: row.children[1].textContent.trim(),
      date_allotted: row.querySelector("input[name='dateAllotted']").value,
      venue_allotted: row.querySelector("input[name='venueAllotted']").value,
      time_from: row.querySelector("input[name='timeFromAllotted']").value,
      time_to: row.querySelector("input[name='timeToAllotted']").value,
      student_coord1: row.children[10].textContent.trim(),
      phone1: row.children[11].textContent.trim(),
      student_coord2: row.children[12].textContent.trim(),
      phone2: row.children[13].textContent.trim(),
      club_mail: row.children[15].textContent.trim(),
      reg_fee: row.children[16].textContent.trim(),
      approved_by: row.querySelector("input[name='approvedBy']").value,
      date_of_approval: row.querySelector("input[name='dapprovalDate']").value,
      comments: row.querySelector("textarea[name='Comments']").value
    };
  
    fetch("/api/submit-final-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(response => {
        alert(response.message || "Submitted successfully!");
      })
      .catch(err => {
        console.error("Submission error:", err);
        alert("Failed to submit!");
      });
  }
  
  
