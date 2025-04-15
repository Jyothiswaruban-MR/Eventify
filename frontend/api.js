const API_URL = "http://localhost:5000/api";

// Register an organizer
async function registerOrganizer(name, email, password, gstId) {
    const response = await fetch(`${API_URL}/organizers/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, gstId })
    });
    return response.json();
}

// Get unapproved organizers (Admin)
async function getUnapprovedOrganizers() {
    const response = await fetch(`${API_URL}/admin/unapproved-organizers`);
    return response.json();
}

// Approve an organizer (Admin)
async function approveOrganizerAPI(orgId) {
    const response = await fetch(`${API_URL}/admin/approve-organizer/${orgId}`, {
        method: "POST"
    });
    return response.json();
}

// Get events by an organizer
async function getOrganizerEvents() {
    const response = await fetch(`${API_URL}/organizer/my-events`);
    return response.json();
}

// Cancel an event
async function cancelEventAPI(eventId) {
    const response = await fetch(`${API_URL}/organizer/events/${eventId}/cancel`, {
        method: "POST"
    });
    return response.json();
}
