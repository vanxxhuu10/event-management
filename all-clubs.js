document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/clubs');
        if (!response.ok) throw new Error('Network response was not ok');

        const clubs = await response.json();
        displayClubs(clubs);
    } catch (error) {
        console.error('Error fetching clubs:', error);
        document.getElementById('clubsContainer').innerHTML = `
            <div class="error" style="text-align:center; color:#e74c3c; grid-column:1/-1">
                Failed to load clubs. Please try again later.
            </div>
        `;
    }
});

function displayClubs(clubs) {
    const container = document.getElementById('clubsContainer');

    if (clubs.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; grid-column:1/-1">
                No clubs found in the database.
            </div>
        `;
        return;
    }

    container.innerHTML = clubs.map(club => `
        <div class="club-card">
            <div class="club-content">
                <div class="club-icon">👥</div>
                <h2 class="club-name">${club.club_name}</h2>
                <p class="club-email">
                    <a href="mailto:${club.club_email}">${club.club_email}</a>
                </p>
            </div>
        </div>
    `).join('');
}
