let selectedIdentity = "";

// Event listener for selecting the Organizer identity
document.getElementById('organizerBox').addEventListener('click', function() {
    toggleSelection('organizer');
});

// Event listener for the "Next" button click
document.querySelector("button").addEventListener("click", function () {
    if (selectedIdentity === 'organizer') {
        // Show the overlay and organizer login form
        document.getElementById("overlay").style.display = "block";
        document.getElementById("organizerLogin").style.display = "block";
    } else if (selectedIdentity === 'club') {
        // Club redirect (optional)
        window.location.href = "login.html";
    } else {
        alert("Please select an identity first.");
    }
});

// Function to verify organizer credentials
function verifyOrganizer() {
    const identity = document.getElementById("identity").value.trim();
    const id = document.getElementById("orgId").value.trim();
    const password = document.getElementById("orgPassword").value.trim();

    fetch("https://event-management-divk.onrender.com/verify-organizer", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({ identity, id, password }),
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
    })
    .then(data => {
        if (data.success) {
            window.location.href = "organizer.html";
        } else {
            alert("Invalid credentials. Please try again.");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Server error. Please try again.");
    });
}


// Event listener for selecting the Club identity
document.getElementById('clubBox').addEventListener('click', function() {
    toggleSelection('club');
});

// Function to toggle between selected identities (Organizer/Club)
function toggleSelection(identity) {
    const organizerBox = document.getElementById('organizerBox');
    const clubBox = document.getElementById('clubBox');
    const organizerContent = document.getElementById('organizerContent');
    const clubContent = document.getElementById('clubContent');

    // Reset styles and content
    organizerBox.classList.remove('identity-selected');
    clubBox.classList.remove('identity-selected');
    organizerContent.style.display = 'none';
    clubContent.style.display = 'none';

    // Apply styles and content based on the selected identity
    if (identity === 'organizer') {
        organizerBox.classList.add('identity-selected');
        organizerContent.style.display = 'block';
        selectedIdentity = 'organizer'; // Track selected identity
    } else {
        clubBox.classList.add('identity-selected');
        clubContent.style.display = 'block';
        selectedIdentity = 'club'; // Track selected identity
    }
}

// Event listener for selecting the "Vibrance" event type
document.getElementById('vibranceBox').addEventListener('click', function() {
    selectEventType('vibrance');
});

// Event listener for selecting the "Techno-VIT" event type
document.getElementById('technoVitBox').addEventListener('click', function() {
    selectEventType('technoVit');
});

// Function to select event type and apply styles
function selectEventType(type) {
    const vibranceBox = document.getElementById('vibranceBox');
    const technoVitBox = document.getElementById('technoVitBox');

    // Reset both boxes
    vibranceBox.classList.remove('identity-selected');
    technoVitBox.classList.remove('identity-selected');

    // Apply selection
    if (type === 'vibrance') {
        vibranceBox.classList.add('identity-selected');
    } else {
        technoVitBox.classList.add('identity-selected');
    }
}
