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

    try {

        const admin = localStorage.getItem("administrator");

        return admin ? JSON.parse(admin) : null;

    } catch (error) {

        return null;

    }

}

// Reads the expiry from the token payload without verifying it; the server
// remains the only authority, this just avoids using a token known to be stale.
function isTokenExpired(token) {

    try {

        const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

        return typeof payload.exp === "number" && payload.exp * 1000 <= Date.now();

    } catch (error) {

        return true;

    }

}

// Checks whether the user is logged in
function isAuthenticated() {

    const token = getToken();

    return !!token && !isTokenExpired(token);

}

// Protects administrator pages
function protectPage() {

    if (!isAuthenticated()) {

        window.location.replace("login.html");

    }

}

// Logs the administrator out
function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("administrator");

    window.location.href = "login.html?reason=logout";

}
