document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      events: [
        {
          title: 'Republic Day',
          start: '2025-01-26',
          color: '#ff704d'
        },
        {
          title: 'Holi',
          start: '2025-03-14',
          color: '#66bb6a'
        },
        {
          title: 'Diwali',
          start: '2025-10-29',
          color: '#ffcc00'
        }
      ]
    });

    calendar.render();
  });



function navigateToClubs() {
    // Add click animation
    const clubsItem = document.querySelector('.nav-item');
    clubsItem.classList.add('clicked');
    
    // Redirect after animation
    setTimeout(() => {
        window.location.href = 'all-clubs.html';
    }, 300);
}

function navigateToEvents() {
    window.location.href = 'all-events.html';
}

function navigateToVenues() {
  window.location.href = 'all-venues.html'; 
}

function navigateToFinalAllotment() {
  window.location.href = 'final-allotment.html';
}
