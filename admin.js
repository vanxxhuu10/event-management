
window.onload = function () {
  // Correct key and password
  const correctKey = "event-management";
  const correctPassword = "VITChennai$123";

  // Prompt the user to enter the key and password
  const enteredKey = prompt("Please enter the admin key:");
  const enteredPassword = prompt("Please enter the admin password:");

  // Check if the entered key and password match the correct ones
  if (enteredKey === correctKey && enteredPassword === correctPassword) {
    // If correct, stay on the admin page
    console.log("Access granted!");
  } else {
    // If incorrect, show an alert and redirect to index.html
    alert("Incorrect key or password. Access denied!");
    window.location.href = "index.html"; // Redirect back to the index page
  }
}



document.addEventListener("DOMContentLoaded", function () {
  const venuesBtn = document.getElementById("venuesBtn");
  const venueTableContainer = document.getElementById("venueTableContainer");

  // Event listener for "All Events" button
  venuesBtn.addEventListener("click", () => {
    loadAllVenuesTable();
  });

  let venuesData = [];

  // Fetch All Venues data
  function loadAllVenuesTable() {
    fetch("https://event-management-divk.onrender.com/get-all-venues")
      .then(response => response.json())
      .then(data => {
        venuesData = data;
        renderEditableTable(data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }

  // Render the table with editable rows
  function renderEditableTable(data) {
    venueTableContainer.innerHTML = ""; // Clear the existing table

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Check if data is empty, and ensure columns are always shown
    if (data.length === 0) {
      venueTableContainer.innerHTML = "<p>No data available. Please add a row.</p>";
      const placeholderRow = { id: "Auto", venue_name: "" }; // Example placeholder row
      data.push(placeholderRow); // Add a placeholder row for the user to edit
    }

    // Create table header
    const headerRow = table.insertRow();
    const headers = Object.keys(data[0]);
    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    // Create table body with editable inputs
    const tbody = table.createTBody();
    data.forEach((row, index) => {
      const tr = tbody.insertRow();
      headers.forEach(key => {
        const cell = tr.insertCell();
        if (key === "id") {
          cell.innerText = row[key]; // Read-only
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.value = row[key];
          input.dataset.key = key;
          input.dataset.index = index;
          input.onchange = updateRowData;
          cell.appendChild(input);
        }
      });

      const actionCell = tr.insertCell();
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => deleteRow(index);
      actionCell.appendChild(deleteBtn);
    });

    venueTableContainer.appendChild(table);

    // Add row button
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addRow;
    addBtn.style.marginTop = "20px";
    venueTableContainer.appendChild(addBtn);

    // Create a single submit button only when the table is rendered
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit";
    submitBtn.onclick = submitData;
    submitBtn.style.marginLeft = "10px";
    venueTableContainer.appendChild(submitBtn);
  }

  // Update row data when an input changes
  function updateRowData(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    venuesData[index][key] = e.target.value;
  }

  // Add a new row to the data
  function addRow() {
    const newRow = { id: "Auto", venue_name: "" }; // Add other fields if necessary
    venuesData.push(newRow);
    renderEditableTable(venuesData);
  }

  // Delete a row
  function deleteRow(index) {
    venuesData.splice(index, 1);
    renderEditableTable(venuesData);
  }

  // Submit data to the server
  function submitData() {
    fetch("https://event-management-divk.onrender.com/update-all-venues", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ venues: venuesData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "All Venues updated successfully!");
        loadAllVenuesTable(); // Reload the table after submitting
      })
      .catch(error => {
        alert("Error submitting data");
        console.error("Error submitting data:", error);
      });
  }
});



document.addEventListener("DOMContentLoaded", function () {
  const venuesAllottedBtn = document.getElementById("venuesAllottedBtn");
  const venueTableContainer = document.getElementById("venueTableContainer");

  // Event listener for "Venues Allotted" button
  venuesAllottedBtn.addEventListener("click", () => {
    loadVenuesAllottedTable();
  });

  let venuesAllottedData = [];

  // Fetch Venues Allotted data
  function loadVenuesAllottedTable() {
    fetch("https://event-management-divk.onrender.com/get-venues-allotted")
      .then(response => response.json())
      .then(data => {
        venuesAllottedData = data;
        document.getElementById("tableTitle").innerText = "Venues Allotted"; // Set the table heading to "Venues Allotted"
        renderEditableTable(data);
      })
      .catch(error => console.error("Error fetching data:", error));
  }

  // Render the table with editable rows
  function renderEditableTable(data) {
    venueTableContainer.innerHTML = ""; // Clear the existing table

    // Create the table element
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Create table header (this will always show)
    const headerRow = table.insertRow();
    const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "date", "event_name", "club_name", "venue_alloted", "time_from", "time_to"];  // Default headers if no data
    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    // Create table body with editable inputs (if data exists)
    const tbody = table.createTBody();
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key];
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.onchange = updateRowData;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteRow(index);
        actionCell.appendChild(deleteBtn);
      });
    } else {
      // If no data is available, show empty row with inputs
      const tr = tbody.insertRow();
      headers.forEach(() => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.value = "";
        input.onchange = updateRowData;
        cell.appendChild(input);
      });

      const actionCell = tr.insertCell();
      actionCell.colSpan = headers.length;
      actionCell.innerText = "No data available";
    }

    venueTableContainer.appendChild(table);

    // Add row button (always visible)
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addRow;
    addBtn.style.marginTop = "20px";
    venueTableContainer.appendChild(addBtn);

    // Create a single submit button only when the table is rendered
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit";
    submitBtn.onclick = submitData;
    submitBtn.style.marginLeft = "10px";
    venueTableContainer.appendChild(submitBtn);
  }

  // Update row data when an input changes
  function updateRowData(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    venuesAllottedData[index][key] = e.target.value;
  }

  // Add a new row to the data
  function addRow() {
    const newRow = { id: "Auto", date: "", event_name: "", club_name: "", venue_alloted: "", time_from: "", time_to: "" }; // Add other fields if necessary
    venuesAllottedData.push(newRow);
    renderEditableTable(venuesAllottedData);
  }

  // Delete a row
  function deleteRow(index) {
    venuesAllottedData.splice(index, 1);
    renderEditableTable(venuesAllottedData);
  }

  // Submit data to the server
  function submitData() {
    fetch("https://event-management-divk.onrender.com/update-venues-allotted", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ venues: venuesAllottedData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Venues Allotted data updated successfully!");
        loadVenuesAllottedTable(); // Reload the table after submitting
      })
      .catch(error => {
        alert("Error submitting data");
        console.error("Error submitting data:", error);
      });
  }
});




document.addEventListener("DOMContentLoaded", function () {
  const venuesPendingBtn = document.getElementById("venuesPendingBtn");
  const venueTableContainer = document.getElementById("venueTableContainer");
  const heading = document.getElementById("tableHeading");  // Assuming you have a heading element with this ID

  // Event listener for "Venues Pending" button
  venuesPendingBtn.addEventListener("click", (event) => {
    event.preventDefault();  // Prevent default link behavior (navigating to "#")
    loadVenuesPendingTable();
  });

  let venuesPendingData = [];

  // Fetch Venues Pending data
  function loadVenuesPendingTable() {
    // Clear any previous error or existing content
    venueTableContainer.innerHTML = '';
  
    fetch("https://event-management-divk.onrender.com/get-venues-pending")
      .then(response => response.json())
      .then(data => {
        console.log("Venues Pending Data:", data); // Log data to the console
  
        // Check if the data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          venuesPendingData = data;
          renderEditableTable(data);
        } else {
          venueTableContainer.innerHTML = "<p>No Venues Pending data found.</p>";
        }
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        venueTableContainer.innerHTML = "<p>Error fetching data. Please try again later.</p>";
      });
  
    // Update heading
    if (heading) {
      heading.innerText = "Venues Pending"; // Update heading to "Venues Pending"
    }
  }
  

  // Render the table with editable rows
  function renderEditableTable(data) {
    venueTableContainer.innerHTML = ""; // Clear the existing table

    // Create a table, even if the data is empty
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    const thead = table.createTHead();
const headerRow = thead.insertRow();

// Use headers based on data or default
const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "date", "venue_pending", "reason"];

headers.forEach(header => {
  const th = document.createElement("th");
  th.innerText = header;
  headerRow.appendChild(th);
});

// Add "Actions" column
const actionTh = document.createElement("th");
actionTh.innerText = "Actions";
headerRow.appendChild(actionTh);

    // Create table body with editable inputs
    const tbody = table.createTBody();
    data.forEach((row, index) => {
      const tr = tbody.insertRow();
      headers.forEach(key => {
        const cell = tr.insertCell();
        if (key === "id") {
          cell.innerText = row[key];
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.value = row[key];
          input.dataset.key = key;
          input.dataset.index = index;
          input.onchange = updateRowData;
          cell.appendChild(input);
        }
      });

      const actionCell = tr.insertCell();
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => deleteRow(index);
      actionCell.appendChild(deleteBtn);
    });

    venueTableContainer.appendChild(table);

    // Add row button
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addRow;
    addBtn.style.marginTop = "20px";
    venueTableContainer.appendChild(addBtn);

    // Create a single submit button only when the table is rendered
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit";
    submitBtn.onclick = submitData;
    submitBtn.style.marginLeft = "10px";
    venueTableContainer.appendChild(submitBtn);
  }

  // Update row data when an input changes
  function updateRowData(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    venuesPendingData[index][key] = e.target.value;
  }

  // Add a new row to the data
  function addRow() {
    const newRow = { id: "Auto", date: "", venue_pending: "", reason: "" }; // Add other fields if necessary
    venuesPendingData.push(newRow);
    renderEditableTable(venuesPendingData);
  }

  // Delete a row
  function deleteRow(index) {
    venuesPendingData.splice(index, 1);
    renderEditableTable(venuesPendingData);
  }

  // Submit data to the server
  function submitData() {
    fetch("https://event-management-divk.onrender.com/update-venues-pending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ venues: venuesPendingData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Venues Pending data updated successfully!");
        loadVenuesPendingTable(); // Reload the table after submitting
      })
      .catch(error => {
        alert("Error submitting data");
        console.error("Error submitting data:", error);
      });
  }
});




document.addEventListener("DOMContentLoaded", () => {
  let currentData = [];

  document.getElementById("eventsBtn").addEventListener("click", loadEventsTable);

  function loadEventsTable() {
    fetch("https://event-management-divk.onrender.com/get-events")
      .then(response => response.json())
      .then(data => {
        currentData = data;
        document.getElementById("tableTitle").innerText = "Events Table";
        renderEditableTable(data);
      })
      .catch(error => {
        console.error("Error fetching events:", error);
      });
  }

  function renderEditableTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = "";

    // Create table
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Create headers
    const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "eventName", "clubName", "date1", "date2", "venue1", "venue2", "venue3", "timeFrom", "timeTo", "eventDescription", "studentCoord1", "phone1", "studentCoord2", "phone2", "facultyCoord", "clubEmail", "fee"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    // Table body with data
    const tbody = table.createTBody();
    if (data.length === 0) {
      // If no data, show empty row with inputs for adding first row
      const tr = tbody.insertRow();
      headers.forEach(key => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = `Enter ${key}`;
        input.dataset.key = key;
        input.dataset.index = 0;
        input.addEventListener("change", updateValue);
        cell.appendChild(input);
      });

      const actionCell = tr.insertCell();
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.disabled = true; // Disable delete button for first row
      actionCell.appendChild(deleteBtn);
    } else {
      // Populate table with existing data
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key];
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.addEventListener("change", updateValue);
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.addEventListener("click", () => deleteRow(index));
        actionCell.appendChild(deleteBtn);
      });
    }

    container.appendChild(table);

    // Always show Add Row button
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.addEventListener("click", addRow);
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Submit Button (optional)
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit Changes";
    submitBtn.addEventListener("click", submitData);
    submitBtn.style.margin = "20px 10px";
    container.appendChild(submitBtn);
  }

  function updateValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    currentData[index][key] = e.target.value;
  }

  function deleteRow(index) {
    currentData.splice(index, 1);
    renderEditableTable(currentData);
  }

  function addRow() {
    const newRow = {
      id: "Auto",
      eventName: "",
      clubName: "",
      date1: "",
      date2: "",
      venue1: "",
      venue2: "",
      venue3: "",
      timeFrom: "",
      timeTo: "",
      eventDescription: "",
      studentCoord1: "",
      phone1: "",
      studentCoord2: "",
      phone2: "",
      facultyCoord: "",
      clubEmail: "",
      fee: ""
    };
    currentData.push(newRow);
    renderEditableTable(currentData);
  }

  function submitData() {
    fetch("https://event-management-divk.onrender.com/update-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ events: currentData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Data updated!");
        loadEventsTable();
      })
      .catch(error => {
        console.error("Submit failed:", error);
        alert("Failed to submit data.");
      });
  }
});


document.addEventListener("DOMContentLoaded", () => {
  let udsData = [];

  // Event listener to load UDS table when button is clicked
  document.getElementById("udsBtn").addEventListener("click", loadUdsTable);

  // Function to load UDS data and render the table
  function loadUdsTable() {
    fetch("https://event-management-divk.onrender.com/get-uds")
      .then(response => response.json())
      .then(data => {
        udsData = data;
        document.getElementById("tableTitle").innerText = "UDS Table";
        renderEditableUdsTable(data);
      });
  }

  // Function to render the editable UDS table
  function renderEditableUdsTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = "";  // Clear previous table

    // Create a table regardless of whether data is present or not
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Check if data is empty, set default empty row
    const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "clubName", "event_date", "event_name", "requirement_name", "quantity"];
    
    // Create table header
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    // If data is available, populate rows, else show empty row for first entry
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key];
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.onchange = updateUdsValue;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteUdsRow(index);
        actionCell.appendChild(deleteBtn);
      });
    } else {
      // Add an empty row to allow adding first row if no data exists
      const tr = tbody.insertRow();
      headers.forEach((key, index) => {
        const cell = tr.insertCell();
        if (index === 0) {
          cell.innerText = "Auto";
        } else {
          const input = document.createElement("input");
          input.type = "text";
          input.value = "";
          input.dataset.key = key;
          input.dataset.index = 0;
          input.onchange = updateUdsValue;
          cell.appendChild(input);
        }
      });
    }

    container.appendChild(table);

    // Add Row Button will always be visible
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addUdsRow;
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Submit Button
    const submitBtn = document.createElement("button");
    submitBtn.innerText = "Submit";
    submitBtn.onclick = submitData;
    submitBtn.style.marginLeft = "10px";
    container.appendChild(submitBtn);
  }

  // Function to update the UDS data when an input value is changed
  function updateUdsValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    udsData[index][key] = e.target.value;
  }

  // Function to delete a UDS row
  function deleteUdsRow(index) {
    udsData.splice(index, 1);
    renderEditableUdsTable(udsData);
  }

  // Function to add a new UDS row
  function addUdsRow() {
    const newRow = {
      id: "Auto",
      clubName: "",
      event_date: "",
      event_name: "",
      requirement_name: "",
      quantity: ""
    };
    udsData.push(newRow);
    renderEditableUdsTable(udsData);
  }

  // Function to submit the updated data to the backend
  function submitData() {
    const tableTitle = document.getElementById("tableTitle").innerText;

    // Submit data for UDS table
    if (tableTitle === "UDS Table") {
      fetch("https://event-management-divk.onrender.com/update-uds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ uds: udsData })
      })
        .then(res => res.json())
        .then(result => {
          alert(result.message || "UDS data updated!");
          loadUdsTable(); // Refresh table
        })
        .catch(error => {
          alert("Error updating UDS data: " + error);
        });

    } else {
      alert("No editable table selected.");
    }
  }
});



document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("postersBtn").addEventListener("click", loadPostersTable);

  let postersData = [];

  // Load Posters Table
  function loadPostersTable() {
    fetch("https://event-management-divk.onrender.com/get-posters")
      .then(response => response.json())
      .then(data => {
        postersData = data;
        document.getElementById("tableTitle").innerText = "Posters Table";
        renderEditablePostersTable(data);
      });
  }

  // Render Editable Posters Table
  function renderEditablePostersTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    // Create a table element even if the data is empty
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Ensure columns are always visible
    const headers = ["id", "clubName", "event_date", "event_name", "drive_link", "upload_on"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header.charAt(0).toUpperCase() + header.slice(1).replace(/_/g, " ");
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key]; // Keep ID read-only
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.onchange = updatePostersValue;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deletePostersRow(index);
        actionCell.appendChild(deleteBtn);
      });
    } else {
      // If no data, show placeholder row with empty inputs
      const tr = tbody.insertRow();
      headers.forEach(() => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.disabled = true; // Disable input until data is added
        cell.appendChild(input);
      });
      const actionCell = tr.insertCell();
      actionCell.innerHTML = ""; // No actions for empty rows
    }

    container.appendChild(table);

    // Always show Add Row Button
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addPostersRow;
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle Value Update
  function updatePostersValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    postersData[index][key] = e.target.value;
  }

  // Handle Row Deletion
  function deletePostersRow(index) {
    postersData.splice(index, 1);
    renderEditablePostersTable(postersData);
  }

  // Handle Row Addition
  function addPostersRow() {
    const newRow = {
      id: "Auto",
      clubName: "",
      event_date: "",
      event_name: "",
      drive_link: "",
      upload_on: ""
    };
    postersData.push(newRow);
    renderEditablePostersTable(postersData);
  }

  // Submit Data Function
  function submitData() {
    const title = document.getElementById("tableTitle").innerText;

    if (title === "Posters Table") {
      fetch("https://event-management-divk.onrender.com/update-posters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ posters: postersData })
      })
        .then(res => res.json())
        .then(result => {
          alert(result.message || "Posters data updated!");
          loadPostersTable(); // Reload the table after submission
        })
        .catch(error => {
          alert("Error updating data: " + error);
        });
    }
  }
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("purchaselistBtn").addEventListener("click", loadPurchaselistTable);

  let purchaselistData = [];

  // Load Purchaselist Table
  function loadPurchaselistTable() {
    fetch("https://event-management-divk.onrender.com/get-purchaselist")
      .then(response => response.json())
      .then(data => {
        purchaselistData = data;
        document.getElementById("tableTitle").innerText = "Purchaselist Table";
        renderEditablePurchaselistTable(data);
      });
  }

  // Render Editable Purchaselist Table
  function renderEditablePurchaselistTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Use predefined headers to ensure columns are always visible
    const headers = ["id", "clubName", "event_date", "event_name", "item_name", "quantity", "price", "source", "amount", "upload_time"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    // Creating the header cells
    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header.charAt(0).toUpperCase() + header.slice(1); // Capitalize first letter
      headerRow.appendChild(th);
    });

    // Add the "Actions" column for buttons
    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    // If there is data, render the rows, otherwise leave empty rows
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key]; // Keep ID read-only
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.index = index;
            input.dataset.key = key;
            input.onchange = updatePurchaselistValue;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deletePurchaselistRow(index);
        actionCell.appendChild(deleteBtn);
      });
    } else {
      // If there's no data, add an empty row
      const tr = tbody.insertRow();
      headers.forEach(key => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.value = "";
        input.dataset.index = 0;  // Placeholder for first row
        input.dataset.key = key;
        input.onchange = updatePurchaselistValue;
        cell.appendChild(input);
      });

      const actionCell = tr.insertCell();
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => deletePurchaselistRow(0);
      actionCell.appendChild(deleteBtn);
    }

    container.appendChild(table);

    // Add Row Button (always visible)
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addPurchaselistRow;
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitPurchaselistBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitPurchaselistBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle Value Update
  function updatePurchaselistValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    purchaselistData[index][key] = e.target.value;
  }

  // Handle Row Deletion
  function deletePurchaselistRow(index) {
    purchaselistData.splice(index, 1);
    renderEditablePurchaselistTable(purchaselistData);
  }

  // Handle Row Addition
  function addPurchaselistRow() {
    const newRow = {
      id: "Auto",
      clubName: "",
      event_date: "",
      event_name: "",
      item_name: "",
      quantity: 0,
      price: 0.0,
      source: "",
      amount: 0.0,
      upload_time: new Date().toISOString()
    };
    purchaselistData.push(newRow);
    renderEditablePurchaselistTable(purchaselistData);
  }

  // Submit Data Function
  function submitData() {
    const title = document.getElementById("tableTitle").innerText;

    if (title === "Purchaselist Table") {
      fetch("https://event-management-divk.onrender.com/update-purchaselist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ purchaselist: purchaselistData })
      })
        .then(res => res.json())
        .then(result => {
          alert(result.message || "Purchaselist data updated!");
          loadPurchaselistTable(); // Reload the table after submission
        })
        .catch(error => {
          alert("Error updating data: " + error);
        });
    }
  }
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("housekeepingBtn").addEventListener("click", loadHousekeepingTable);

  let housekeepingData = [];

  // Load Housekeeping Table
  function loadHousekeepingTable() {
    fetch("https://event-management-divk.onrender.com/get-housekeeping")
      .then(response => response.json())
      .then(data => {
        housekeepingData = data;
        document.getElementById("tableTitle").innerText = "Housekeeping Table";
        renderEditableHousekeepingTable(data);
      });
  }

  // Render Editable Housekeeping Table
  function renderEditableHousekeepingTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "clubName", "event_date", "event_name", "requirement_name", "quantity"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    // Create header cells
    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    // Add "Actions" column header
    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    // If there is data, render the rows, otherwise leave an empty row
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key]; // Keep ID read-only
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.onchange = updateHousekeepingValue;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteHousekeepingRow(index);
        actionCell.appendChild(deleteBtn);
      });
    } else {
      // If no data, add an empty row
      const tr = tbody.insertRow();
      headers.forEach((key, index) => {
        const cell = tr.insertCell();
        const input = document.createElement("input");
        input.type = "text";
        input.value = "";
        input.dataset.key = key;
        input.dataset.index = 0;  // Placeholder for first row
        input.onchange = updateHousekeepingValue;
        cell.appendChild(input);
      });

      const actionCell = tr.insertCell();
      const deleteBtn = document.createElement("button");
      deleteBtn.innerText = "Delete";
      deleteBtn.onclick = () => deleteHousekeepingRow(0);
      actionCell.appendChild(deleteBtn);
    }

    container.appendChild(table);

    // Add Row Button (always visible)
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addHousekeepingRow;
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitHousekeepingBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitHousekeepingBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle Value Update
  function updateHousekeepingValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    housekeepingData[index][key] = e.target.value;
  }

  // Handle Row Deletion
  function deleteHousekeepingRow(index) {
    housekeepingData.splice(index, 1);
    renderEditableHousekeepingTable(housekeepingData);
  }

  // Handle Row Addition
  function addHousekeepingRow() {
    const newRow = {
      id: "Auto",
      clubName: "",
      event_date: "",
      event_name: "",
      requirement_name: "",
      quantity: ""
    };
    housekeepingData.push(newRow);
    renderEditableHousekeepingTable(housekeepingData);
  }

  // Submit Data Function
  function submitData() {
    fetch("https://event-management-divk.onrender.com/update-housekeeping", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ housekeeping: housekeepingData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Housekeeping data updated!");
        loadHousekeepingTable(); // Reload the table after submission
      })
      .catch(error => {
        alert("Error updating data: " + error);
      });
  }
});


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("wifiBtn").addEventListener("click", loadWifiTable);

  let wifiData = [];

  // Load WIFI Table when WIFI button is clicked
  function loadWifiTable() {
    fetch("https://event-management-divk.onrender.com/get-wifi")
      .then(res => res.json())
      .then(data => {
        wifiData = data;
        document.getElementById("tableTitle").innerText = "WIFI Table";
        renderWifiTable();
      });
  }

  // Render WIFI Table
  function renderWifiTable() {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    // Create table even if data is empty
    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Define headers for the table
    const headers = ["id", "clubName", "event_date", "event_name", "requirement_name", "quantity"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header.charAt(0).toUpperCase() + header.slice(1); // Capitalize the first letter
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    // If there is data, populate the table rows
    if (wifiData.length > 0) {
      wifiData.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key]; // Keep ID read-only
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.index = index;
            input.dataset.key = key;
            input.addEventListener("input", handleWifiEdit);
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
          wifiData.splice(index, 1);
          renderWifiTable();
        };
        actionCell.appendChild(delBtn);
      });
    } else {
      // Show an empty row for column structure
      const tr = tbody.insertRow();
      headers.forEach(() => {
        const cell = tr.insertCell();
        cell.innerText = "";
      });
      const actionCell = tr.insertCell();
      actionCell.innerHTML = "<em>No data yet</em>";
    }

    container.appendChild(table);

    // Add Row Button (always visible)
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = () => {
      wifiData.push({
        id: "Auto",
        clubName: "",
        event_date: "",
        event_name: "",
        requirement_name: "",
        quantity: ""
      });
      renderWifiTable();
    };
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitWifiBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitWifiBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitWifiData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle WIFI Table Edit
  function handleWifiEdit(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    wifiData[index][key] = e.target.value;
  }

  // Submit WIFI Data to Server
  function submitWifiData() {
    fetch("https://event-management-divk.onrender.com/update-wifi", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ wifi: wifiData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "WIFI data updated!");
        loadWifiTable(); // Reload the table after submission
      })
      .catch(error => {
        alert("Error updating data: " + error);
      });
  }
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("sponsorsBtn").addEventListener("click", loadSponsorsTable);

  let sponsorsData = [];

  // Load Sponsors Table when Sponsors button is clicked
  function loadSponsorsTable() {
    fetch("https://event-management-divk.onrender.com/get-sponsors")
      .then(response => response.json())
      .then(data => {
        sponsorsData = data;
        document.getElementById("tableTitle").innerText = "Sponsors Table";
        renderEditableSponsorsTable(data);
      });
  }

  // Render Sponsors Table
  function renderEditableSponsorsTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Define headers for the table
    const headers = ["id", "clubName", "event_date", "event_name", "sponsor_name", "amount", "status"];
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    // Create header cells
    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header.charAt(0).toUpperCase() + header.slice(1); // Capitalize first letter
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    // If there is data, populate the table rows
    if (data.length > 0) {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
          const cell = tr.insertCell();
          if (key === "id") {
            cell.innerText = row[key]; // Keep ID read-only
          } else {
            const input = document.createElement("input");
            input.type = "text";
            input.value = row[key];
            input.dataset.key = key;
            input.dataset.index = index;
            input.onchange = updateSponsorValue;
            cell.appendChild(input);
          }
        });

        const actionCell = tr.insertCell();
        const delBtn = document.createElement("button");
        delBtn.textContent = "Delete";
        delBtn.onclick = () => {
          sponsorsData.splice(index, 1);
          renderEditableSponsorsTable(sponsorsData);
        };
        actionCell.appendChild(delBtn);
      });
    } else {
      // Show an empty row with column structure when there's no data
      const tr = tbody.insertRow();
      headers.forEach(() => {
        const cell = tr.insertCell();
        cell.innerText = "";
      });
      const actionCell = tr.insertCell();
      actionCell.innerHTML = "<em>No data yet</em>";
    }

    container.appendChild(table);

    // Always display the "Add Row" button
    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = () => {
      sponsorsData.push({
        id: "Auto",
        clubName: "",
        event_date: "",
        event_name: "",
        sponsor_name: "",
        amount: 0,
        status: ""
      });
      renderEditableSponsorsTable(sponsorsData);
    };
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitSponsorsBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitSponsorsBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitSponsorsData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle Sponsor Table Edit
  function updateSponsorValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    sponsorsData[index][key] = e.target.value;
  }

  // Submit Sponsors Data to Server
  function submitSponsorsData() {
    fetch("https://event-management-divk.onrender.com/update-sponsors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ sponsors: sponsorsData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Sponsors data updated!");
        loadSponsorsTable(); // Reload the table after submission
      })
      .catch(error => {
        alert("Error updating data: " + error);
      });
  }
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("organizersBtn").addEventListener("click", loadOrganizersTable);

  let organizersData = [];

  // Load Organizers Table when Organizers button is clicked
  function loadOrganizersTable() {
    fetch("https://event-management-divk.onrender.com/get-organizers")
      .then(response => response.json())
      .then(data => {
        organizersData = data;
        document.getElementById("tableTitle").innerText = "Organizers Table";
        renderEditableOrganizersTable(data);
      });
  }

  // Render Organizers Table
  function renderEditableOrganizersTable(data) {
    const container = document.getElementById("venueTableContainer");
    container.innerHTML = ""; // Clear previous content

    const table = document.createElement("table");
    table.border = "1";
    table.style.width = "100%";

    // Create table headers (even if no data is available)
    const headers = data.length > 0 ? Object.keys(data[0]) : ['identity', 'id', 'password']; // Default headers if no data
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
      const th = document.createElement("th");
      th.innerText = header;
      headerRow.appendChild(th);
    });

    const actionTh = document.createElement("th");
    actionTh.innerText = "Actions";
    headerRow.appendChild(actionTh);

    const tbody = table.createTBody();

    if (data.length === 0) {
      const tr = tbody.insertRow();
      headers.forEach(() => {
        const cell = tr.insertCell();
        cell.innerText = "No data available";
      });
    } else {
      data.forEach((row, index) => {
        const tr = tbody.insertRow();
        headers.forEach(key => {
    const cell = tr.insertCell();
    const input = document.createElement("input");
    input.type = "text";
    input.value = row[key];
    input.dataset.key = key;
    input.dataset.index = index;
    input.onchange = updateOrganizerValue;

  // Removed: if (key === "id") { input.readOnly = true; }

    cell.appendChild(input);
  });

        const actionCell = tr.insertCell();
        const deleteBtn = document.createElement("button");
        deleteBtn.innerText = "Delete";
        deleteBtn.onclick = () => deleteOrganizerRow(index);
        actionCell.appendChild(deleteBtn);
      });
    }

    container.appendChild(table);

    const addBtn = document.createElement("button");
    addBtn.innerText = "Add Row";
    addBtn.onclick = addOrganizerRow;
    addBtn.style.marginTop = "20px";
    container.appendChild(addBtn);

    // Create Submit Button (only once when table is loaded)
    const existingSubmitBtn = document.getElementById("submitOrganizersBtn");
    if (!existingSubmitBtn) {
      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.id = "submitOrganizersBtn"; // Assign an ID to prevent creating multiple buttons
      submitBtn.onclick = submitOrganizersData;
      submitBtn.style.marginLeft = "10px";
      container.appendChild(submitBtn);
    }
  }

  // Handle Organizer Table Edit
  function updateOrganizerValue(e) {
    const index = e.target.dataset.index;
    const key = e.target.dataset.key;
    organizersData[index][key] = e.target.value;
  }

  // Delete Organizer Row
  function deleteOrganizerRow(index) {
    organizersData.splice(index, 1);
    renderEditableOrganizersTable(organizersData);
  }

  // Add Organizer Row
  function addOrganizerRow() {
    const newRow = {
      identity: "",
      id: "",
      password: ""
    };
    organizersData.push(newRow);
    renderEditableOrganizersTable(organizersData);
  }

  // Submit Organizers Data to Server
  function submitOrganizersData() {
    fetch("https://event-management-divk.onrender.com/update-organizers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ organizers: organizersData })
    })
      .then(res => res.json())
      .then(result => {
        alert(result.message || "Organizers data updated!");
        loadOrganizersTable(); // Reload the table after submission
      })
      .catch(error => {
        alert("Error updating data: " + error);
      });
  }
});



document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("finalEventsBtn").addEventListener("click", () => {
    let currentData = [];

    function loadFinalEventsTable() {
      fetch("https://event-management-divk.onrender.com/get-final-events")
        .then(response => response.json())
        .then(data => {
          currentData = data;
          document.getElementById("tableTitle").innerText = "Final Events Table";
          renderEditableFinalEventsTable(data);
        });
    }

    function renderEditableFinalEventsTable(data) {
      const container = document.getElementById("venueTableContainer");
      container.innerHTML = ""; // Clear previous content

      const table = document.createElement("table");
      table.border = "1";
      table.style.width = "100%";

      // Create table headers (even if no data is available)
      const headers = data.length > 0 ? Object.keys(data[0]) : [
        "id", "present_date", "event_name", "club_name", "date_allotted",
        "venue_allotted", "time_from", "time_to", "student_coord1", "phone1",
        "student_coord2", "phone2", "club_mail", "reg_fee", "approved_by",
        "date_of_approval", "comments"
      ]; // Default headers if no data

      const thead = table.createTHead();
      const headerRow = thead.insertRow();

      headers.forEach(header => {
        const th = document.createElement("th");
        th.innerText = header;
        headerRow.appendChild(th);
      });

      const actionTh = document.createElement("th");
      actionTh.innerText = "Actions";
      headerRow.appendChild(actionTh);

      const tbody = table.createTBody();

      if (data.length === 0) {
        const tr = tbody.insertRow();
        headers.forEach(() => {
          const cell = tr.insertCell();
          cell.innerText = "No data available"; // Placeholder when no data
        });
      } else {
        data.forEach((row, index) => {
          const tr = tbody.insertRow();
          headers.forEach(key => {
            const cell = tr.insertCell();
            if (key === "id") {
              cell.innerText = row[key]; // Read-only primary key
            } else {
              const input = document.createElement("input");
              input.type = "text";
              input.value = row[key];
              input.dataset.key = key;
              input.dataset.index = index;
              input.onchange = updateFinalEventValue;
              cell.appendChild(input);
            }
          });

          const actionCell = tr.insertCell();
          const deleteBtn = document.createElement("button");
          deleteBtn.innerText = "Delete";
          deleteBtn.onclick = () => deleteFinalEventRow(index);
          actionCell.appendChild(deleteBtn);
        });
      }

      container.appendChild(table);

      const addBtn = document.createElement("button");
      addBtn.innerText = "Add Row";
      addBtn.onclick = addFinalEventRow;
      addBtn.style.marginTop = "20px";
      container.appendChild(addBtn);

      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.style.marginTop = "20px";
      submitBtn.onclick = submitFinalEventsData;
      container.appendChild(submitBtn);
    }

    function updateFinalEventValue(e) {
      const index = e.target.dataset.index;
      const key = e.target.dataset.key;
      currentData[index][key] = e.target.value;
    }

    function deleteFinalEventRow(index) {
      currentData.splice(index, 1);
      renderEditableFinalEventsTable(currentData);
    }

    function addFinalEventRow() {
      const newRow = {
        id: "Auto",
        present_date: "",
        event_name: "",
        club_name: "",
        date_allotted: "",
        venue_allotted: "",
        time_from: "",
        time_to: "",
        student_coord1: "",
        phone1: "",
        student_coord2: "",
        phone2: "",
        club_mail: "",
        reg_fee: "",
        approved_by: "",
        date_of_approval: "",
        comments: ""
      };
      currentData.push(newRow);
      renderEditableFinalEventsTable(currentData);
    }

    function submitFinalEventsData() {
      fetch("https://event-management-divk.onrender.com/update-final-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ events: currentData })
      })
        .then(res => res.json())
        .then(result => {
          alert(result.message || "Final Events data updated!");
          loadFinalEventsTable();
        });
    }

    loadFinalEventsTable(); // initial call when button is clicked
  });
});


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("usersBtn").addEventListener("click", () => {
    let currentData = [];

    function loadUsersTable() {
  fetch("https://event-management-divk.onrender.com/get-users")
    .then(async response => {
      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server Error: ${response.status} - ${errorText}`);
      }

      if (contentType && contentType.includes("application/json")) {
        return response.json();
      } else {
        throw new Error("Response is not JSON");
      }
    })
    .then(data => {
      currentData = data;
      document.getElementById("tableTitle").innerText = "Users Table";
      renderEditableUsersTable(data);
    })
    .catch(error => {
      console.error("Error loading users:", error.message);
      alert("Failed to load users. Check console for more details.");
    });
}


    function renderEditableUsersTable(data) {
      const container = document.getElementById("venueTableContainer");
      container.innerHTML = "";

      const table = document.createElement("table");
      table.border = "1";
      table.style.width = "100%";

      const headers = data.length > 0 ? Object.keys(data[0]) : ["id", "club_name", "club_email", "password"];

      const thead = table.createTHead();
      const headerRow = thead.insertRow();

      headers.forEach(header => {
        const th = document.createElement("th");
        th.innerText = header;
        headerRow.appendChild(th);
      });

      const actionTh = document.createElement("th");
      actionTh.innerText = "Actions";
      headerRow.appendChild(actionTh);

      const tbody = table.createTBody();

      if (data.length === 0) {
        const tr = tbody.insertRow();
        headers.forEach(() => {
          const cell = tr.insertCell();
          cell.innerText = "No data available";
        });
      } else {
        data.forEach((row, index) => {
          const tr = tbody.insertRow();
          headers.forEach(key => {
            const cell = tr.insertCell();
            if (key === "id") {
              cell.innerText = row[key];
            } else {
              const input = document.createElement("input");
              input.type = key === "password" ? "password" : "text";
              input.value = row[key];
              input.dataset.key = key;
              input.dataset.index = index;
              input.onchange = updateUserValue;
              cell.appendChild(input);
            }
          });

          const actionCell = tr.insertCell();
          const deleteBtn = document.createElement("button");
          deleteBtn.innerText = "Delete";
          deleteBtn.onclick = () => deleteUserRow(index);
          actionCell.appendChild(deleteBtn);
        });
      }

      container.appendChild(table);

      const addBtn = document.createElement("button");
      addBtn.innerText = "Add Row";
      addBtn.onclick = addUserRow;
      addBtn.style.marginTop = "20px";
      container.appendChild(addBtn);

      const submitBtn = document.createElement("button");
      submitBtn.innerText = "Submit";
      submitBtn.style.marginTop = "20px";
      submitBtn.onclick = submitUserData;
      container.appendChild(submitBtn);
    }

    function updateUserValue(e) {
      const index = e.target.dataset.index;
      const key = e.target.dataset.key;
      currentData[index][key] = e.target.value;
    }

    function deleteUserRow(index) {
      currentData.splice(index, 1);
      renderEditableUsersTable(currentData);
    }

    function addUserRow() {
      const newRow = {
        club_name: "",
        club_email: "",
        password: ""
      };
      currentData.push(newRow);
      renderEditableUsersTable(currentData);
    }

    function submitUserData() {
      fetch("https://event-management-divk.onrender.com/update-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ users: currentData })
      })
        .then(res => res.json())
        .then(result => {
          alert(result.message || "Users data updated!");
          loadUsersTable();
        });
    }

    loadUsersTable();
  });
});




