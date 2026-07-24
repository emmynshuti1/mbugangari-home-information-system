/*
========================================
AUTHENTICATION FUNCTIONS
========================================
*/

// Returns the saved JWT token
function getToken() {

    return localStorage.getItem("token");

}

// Returns the logged-in administrator
function getAdministrator() {

    const admin = localStorage.getItem("administrator");

    return admin ? JSON.parse(admin) : null;

}

// Checks whether the user is logged in
function isAuthenticated() {

    return !!getToken();

}

// Protects administrator pages
function protectPage() {

    if (!isAuthenticated()) {

        alert("Please log in first.");

        window.location.href = "login.html";

    }

}

// Logs the administrator out
function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("administrator");

    window.location.href = "../index.html";

}