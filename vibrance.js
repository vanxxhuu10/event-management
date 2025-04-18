// Fetch and populate data from backend



fetch('/api/final-events')
.then(res => res.json())
.then(data => {
  const tbody = document.getElementById("vibranceTable").querySelector("tbody");
  data.forEach(event => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${event.present_date}</td>
      <td>${event.event_name}</td>
      <td>${event.club_name}</td>
      <td>${event.date_allotted}</td>
      <td>${event.venue_allotted}</td>
      <td>${event.time_from}</td>
      <td>${event.time_to}</td>
      <td>${event.student_coord1}</td>
      <td>${event.phone1}</td>
      <td>${event.student_coord2}</td>
      <td>${event.phone2}</td>
      <td>${event.club_mail}</td>
      <td>${event.reg_fee}</td>
      <td>${event.approved_by}</td>
      <td>${event.date_of_approval}</td>
      <td>${event.comments}</td>
    `;
    tbody.appendChild(row);
  });
})
.catch(err => {
  console.error("Failed to load final events:", err);
});

document.addEventListener("DOMContentLoaded", () => {
    const table = document.getElementById("vibranceTable");

    table.addEventListener("click", (e) => {
      const cell = e.target.closest("td");
      if (!cell) return;

      // Toggle expanded class
      if (cell.classList.contains("expanded")) {
        cell.classList.remove("expanded");
      } else {
        // First collapse any other expanded cells
        document.querySelectorAll("td.expanded").forEach(c => c.classList.remove("expanded"));
        cell.classList.add("expanded");
      }
    });
  });