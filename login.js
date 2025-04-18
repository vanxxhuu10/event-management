// login.js
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';

    const clubNameInput = document.getElementById('club_name');
    const clubEmailInput = document.getElementById('club_email');
    const passwordInput = document.getElementById('password');

    const clubName = clubNameInput.value.trim();
    const clubEmail = clubEmailInput.value.trim();
    const password = passwordInput.value;

    if (!clubName || !clubEmail || !password) {
        alert('Please fill in all the fields');
        return;
    }

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                club_name: clubName,
                club_email: clubEmail,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            // Store club name in sessionStorage
            sessionStorage.setItem('clubName', clubName);
            alert(`Logged in as ${clubName}`);
            // Redirect to home or requirements page
            window.location.href = '/home_page.html';
        } else {
            errorElement.textContent = data.error || 'Invalid login credentials';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorElement.textContent = 'Server error. Please try again.';
    }
});
