function updateAmount(type) {
    const priceId = `${type}-price`;
    const quantityId = `${type}-quantity`;
    const amountId = `${type}-amount`;
  
    const price = parseFloat(document.getElementById(priceId).value) || 0;
    const quantity = parseFloat(document.getElementById(quantityId).value) || 0;
    const amount = price * quantity;
  
    document.getElementById(amountId).value = amount.toFixed(2);
  }
  
  function showForm(type) {
    document.getElementById('online-form').style.display = type === 'online' ? 'block' : 'none';
    document.getElementById('offline-form').style.display = type === 'offline' ? 'block' : 'none';
  }
  
  function addItem(type) {
    let itemName, quantity, price, link, amount;

    if (type === 'online') {
        itemName = document.getElementById('online-item').value;
        quantity = parseFloat(document.getElementById('online-quantity').value) || 0;
        price = parseFloat(document.getElementById('online-price').value) || 0;
        link = document.getElementById('online-link').value;
        amount = (price * quantity).toFixed(2);
    } else if (type === 'offline') {
        itemName = document.getElementById('offline-item').value;
        quantity = parseFloat(document.getElementById('offline-quantity').value) || 0;
        price = parseFloat(document.getElementById('offline-price').value) || 0;
        link = document.getElementById('offline-link').value;
        amount = (price * quantity).toFixed(2);
    }

    // If the link is empty, set it to 'NA'
    if (!link.trim()) {
        link = 'NA';
    } else {
        // If it's not empty, format the link as "View Here"
        if (type === 'online') {
            link = `<a href="${link}" target="_blank">View Here</a>`;
        } else {
            link = link; // For offline, just show the text (no need for a link)
        }
    }

    const tableId = type === 'online' ? 'online-table' : 'offline-table';
    const table = document.getElementById(tableId).getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    // Add data to the row
    newRow.innerHTML = `
      <td>${itemName}</td>
      <td>${quantity}</td>
      <td>${price}</td>
      <td>${link}</td>
      <td>${amount}</td>
      <td><button onclick="deleteRow(this)">Delete</button></td>
    `;

    // Clear inputs after adding
    document.getElementById(`${type}-item`).value = '';
    document.getElementById(`${type}-quantity`).value = '';
    document.getElementById(`${type}-price`).value = '';
    document.getElementById(`${type}-link`).value = '';
    document.getElementById(`${type}-amount`).value = '';
}

// Function to delete a row
function deleteRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
}


function submitData() {
  const eventDate = document.getElementById('eventDate').value;
  const eventName = document.getElementById('eventName').value;

  // Get club name from session storage
  const clubName = sessionStorage.getItem('clubName') || '';

  if (!eventDate || !eventName || !clubName) {
    alert('Event details are missing!');
    return;
  }

  // Prepare the data for online and offline items
  const onlineData = [];
  const offlineData = [];

  const onlineRows = document.querySelectorAll('#online-table tbody tr');
  const offlineRows = document.querySelectorAll('#offline-table tbody tr');

  // Collect online data
  onlineRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    onlineData.push({
      item_name: cells[0].innerText,
      quantity: cells[1].innerText,
      price: cells[2].innerText,
      source: cells[3].innerText,
      amount: cells[4].innerText,
      event_date: eventDate,
      event_name: eventName
    });
  });

  // Collect offline data
  offlineRows.forEach(row => {
    const cells = row.querySelectorAll('td');
    offlineData.push({
      item_name: cells[0].innerText,
      quantity: cells[1].innerText,
      price: cells[2].innerText,
      source: cells[3].innerText,
      amount: cells[4].innerText,
      event_date: eventDate,
      event_name: eventName
    });
  });

  // Prepare the payload to be sent to the server
  const purchaseData = {
    clubName,
    eventDate,
    eventName,
    onlineData,
    offlineData
  };

  // Send data to the server
  fetch('https://event-management-divk.onrender.com/submit-purchase-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(purchaseData)
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      alert('Purchase data submitted successfully!');
    } else {
      alert('Failed to submit purchase data! ' + (data.error || ''));
    }
  })
  .catch(error => {
    console.error('Error submitting purchase data:', error);
    alert('Error submitting purchase data!');
  });
}

  
  
function generateReceipt() {
  const { jsPDF } = window.jspdf;

  const eventName = document.getElementById('eventName').value.trim();
  const eventDate = document.getElementById('eventDate').value;

  if (!eventName || !eventDate) {
    alert("Please enter both the Event Name and Present Date.");
    return;
  }

  function generateTable(doc, tableId, type, yPosition) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');

    let total = 0;

    if (rows.length === 0) {
      doc.text(`No ${type} purchases added.`, 20, yPosition);
      return yPosition + 10;
    }

    // Table headers
    doc.setFontSize(12);
    doc.text('Item', 20, yPosition);
    doc.text('Qty', 80, yPosition);
    doc.text('Price', 110, yPosition);
    doc.text('Amount', 150, yPosition);
    yPosition += 10;

    rows.forEach(row => {
      const columns = row.querySelectorAll('td');
      const item = columns[0].textContent.trim();
      const quantity = columns[1].textContent.trim();
      const price = columns[2].textContent.trim();
      const amount = parseFloat(columns[4].textContent.trim()) || 0;

      total += amount;

      doc.text(item, 20, yPosition);
      doc.text(quantity, 80, yPosition);
      doc.text(price, 110, yPosition);
      doc.text(amount.toFixed(2), 150, yPosition);

      yPosition += 10;
    });

    // Add Total
    yPosition += 5;
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.text("Total:", 120, yPosition);
    doc.text(total.toFixed(2), 150, yPosition);
    doc.setFont(undefined, 'normal');

    return yPosition + 10;
  }

  const includeOnline = document.getElementById('online-form').style.display !== 'none';
  const includeOffline = document.getElementById('offline-form').style.display !== 'none';

  const doc = new jsPDF();
  let y = 30;

  doc.setFontSize(18);
  doc.text(eventName, 105, y, null, null, 'center');
  doc.setFontSize(12);
  doc.text(`Present Date: ${eventDate}`, 105, y + 10, null, null, 'center');
  y += 25;

  if (includeOnline) {
    doc.setFontSize(14);
    doc.text("Online Purchases", 20, y);
    y += 10;
    y = generateTable(doc, 'online-table', 'online', y);
    y += 10;
  }

  if (includeOffline) {
    doc.setFontSize(14);
    doc.text("Offline Purchases", 20, y);
    y += 10;
    y = generateTable(doc, 'offline-table', 'offline', y);
  }

  const filename = `${eventName.replace(/\s+/g, '_')}_Receipt.pdf`;
  doc.save(filename);
}
