let selectedStatus = '';
let editingRow = null;

function setStatus(status) {
  selectedStatus = status;
  ['btn-pending', 'btn-ongoing', 'btn-achieved'].forEach(id => {
    document.getElementById(id).classList.remove('active');
  });
  if (status) {
    document.getElementById('btn-' + status.toLowerCase()).classList.add('active');
  }
}

function addSponsor() {
  const name = document.getElementById('event-name').value;
  const date = document.getElementById('event-date').value;
  const sponsor = document.getElementById('sponsor-name').value;
  const amount = document.getElementById('sponsor-amount').value;

  if (!name || !date || !sponsor || !amount || !selectedStatus) {
    alert("Please fill in all fields and select a status.");
    return;
  }

  if (editingRow) {
    // Update the row being edited
    editingRow.cells[0].innerText = name;
    editingRow.cells[1].innerText = date;
    editingRow.cells[2].innerText = sponsor;
    editingRow.cells[3].innerText = amount;
    editingRow.cells[4].innerText = selectedStatus;
    editingRow = null; // Clear edit mode
  } else {
    // Insert new row
    const table = document.getElementById('sponsor-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow(0);

    newRow.innerHTML = `
      <td>${name}</td>
      <td>${date}</td>
      <td>${sponsor}</td>
      <td>${amount}</td>
      <td>${selectedStatus}</td>
      <td>
        <button class="edit-button" onclick="editRow(this)">Edit</button>
        <button class="delete-button" onclick="deleteRow(this)">Delete</button>
      </td>
    `;
  }

  // Clear inputs
  document.getElementById('event-name').value = '';
  document.getElementById('event-date').value = '';
  document.getElementById('sponsor-name').value = '';
  document.getElementById('sponsor-amount').value = '';
  setStatus('');
}

function editRow(button) {
  editingRow = button.closest("tr");
  const cells = editingRow.cells;

  document.getElementById('event-name').value = cells[0].innerText;
  document.getElementById('event-date').value = cells[1].innerText;
  document.getElementById('sponsor-name').value = cells[2].innerText;
  document.getElementById('sponsor-amount').value = cells[3].innerText;
  setStatus(cells[4].innerText);
}

function deleteRow(button) {
  const row = button.closest("tr");
  row.remove();

  // If the deleted row was being edited, reset edit mode
  if (editingRow === row) {
    editingRow = null;
    document.getElementById('event-name').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('sponsor-name').value = '';
    document.getElementById('sponsor-amount').value = '';
    setStatus('');
  }
}

function submitSponsors() {
  const rows = document.getElementById('sponsor-table').querySelectorAll('tbody tr');
  const sponsors = [];
  const clubName = sessionStorage.getItem("clubName"); // get club name

  rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      sponsors.push({
          eventName: cells[0].textContent,
          eventDate: cells[1].textContent,
          sponsorName: cells[2].textContent,
          sponsorAmount: cells[3].textContent,
          status: cells[4].textContent,
          clubName: clubName // send with each object
      });
  });

  fetch('https://event-management-divk.onrender.com/submit-sponsors', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify(sponsors)
  }).then(response => {
      if (response.ok) {
          alert('Sponsors submitted successfully!');
      } else {
          alert('Error submitting sponsors');
      }
  });
}

