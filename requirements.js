function toggleSection(sectionId) {
    const sections = document.querySelectorAll('.requirement-section');
    sections.forEach(section => {
      section.classList.remove('active');
    });
  
    const section = document.getElementById(sectionId);
    section.classList.add('active');
  }
  
  
  function addTableItem(section) {
    const nameInput = document.getElementById(`${section}NameInput`);
    const quantityInput = document.getElementById(`${section}QuantityInput`);
    const tableBody = document.getElementById(`${section}TableBody`);
  
    if (nameInput.value.trim() === '') {
      alert('Please enter requirement name');
      return;
    }
  
    // Use "NA" if quantity field is empty
    const quantityValue = quantityInput.value.trim() === '' ? 'NA' : quantityInput.value;
  
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
      <td>${nameInput.value}</td>
      <td>${quantityValue}</td>
      <td>
        <button class="delete-btn" onclick="this.closest('tr').remove()">Delete</button>
      </td>
    `;
  
    tableBody.appendChild(newRow);
    
    // Clear inputs
    nameInput.value = '';
    quantityInput.value = '';
  }
  
     

  function addWifiRequirement() {
    const quantitySelect = document.getElementById('wifiQuantitySelect');
    const wifiList = document.getElementById('wifiList');
  
    if (quantitySelect.value === '') {
      alert('Please select quantity range');
      return;
    }
  
    // Clear previous WiFi entry to allow only one
    wifiList.innerHTML = '';
  
    const listItem = document.createElement('li');
    listItem.textContent = `WIFI (${quantitySelect.value})`;
    listItem.classList.add('wifi-item'); // So we can find it later
  
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function () {
      wifiList.removeChild(listItem);
    };
  
    listItem.appendChild(deleteBtn);
    wifiList.appendChild(listItem);
  
    // Clear dropdown
    quantitySelect.value = '';
  }

  document.getElementById('wifiQuantitySelect').addEventListener('change', function () {
    if (this.value !== '') {
      addWifiRequirement();
    }
  });

      document.getElementById('requirementsForm').addEventListener('submit', async function (e) {
        e.preventDefault();
    
        const uds = document.getElementById('udsTableBody').textContent;
        const hk = document.getElementById('housekeepingTableBody').textContent;
        
        console.log("Submitted Requirements:");
        console.log("UDS:", uds);
        console.log("Housekeeping:", hk);
    
        alert("Requirements submitted successfully!");
    
        const clubName = sessionStorage.getItem('clubName') || ''; // Get signed-in club name
        const eventName = document.getElementById('eventName').value.trim();
const eventDate = document.getElementById('eventDate').value;

        // ✅ UDS data
        const udsRows = document.querySelectorAll('#udsTableBody tr');
        const udsData = Array.from(udsRows).map(row => ({
            requirement_name: row.querySelector('td:nth-child(1)').textContent.trim(),
            quantity: row.querySelector('td:nth-child(2)').textContent.trim()
        }));
    
        // ✅ Housekeeping data
        const housekeepingRows = document.querySelectorAll('#housekeepingTableBody tr');
        const housekeepingData = Array.from(housekeepingRows).map(row => ({
            requirement_name: row.querySelector('td:nth-child(1)').textContent.trim(),
            quantity: row.querySelector('td:nth-child(2)').textContent.trim()
        }));
    
        // ✅ WiFi data (either from selected dropdown or added list item)
        let wifi = 'NA';
        const wifiItem = document.querySelector('#wifiList .wifi-item');
        
        if (wifiItem) {
            const match = wifiItem.textContent.match(/(\d+-\d+|\d+)/); // Match range like "40-50" or "300"
            if (match) {
                wifi = match[0];
            }
        } else {
            // fallback to dropdown in case item was not added to list
            const dropdownValue = document.getElementById('wifiQuantitySelect').value;
            if (dropdownValue) {
                wifi = dropdownValue;
            }
        }
    
        const wifiData = {
            event_date: eventDate,
            eventName: eventName,
            requirement_name: 'WIFI',
            quantity: wifi
        };
    
        console.log("WiFi:", wifiData);
    
        // ✅ Final payload
        const payload = {
            clubName,
            eventName,
            eventDate,
            udsData,
            housekeepingData,
            wifiData
        };
    
        console.log("Payload to send:", payload);
    
        // ✅ Send data to backend (example)
        try {
            const response = await fetch('https://event-management-divk.onrender.com/submit-requirements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
    
            const result = await response.json();
            console.log("Server response:", result);
        } catch (error) {
            console.error("Error submitting data:", error);
        }
    });
    
    
    
  
