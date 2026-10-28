const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");
const params = new URLSearchParams(window.location.search);

document.querySelectorAll("[data-icon]").forEach(node => node.insertAdjacentHTML("afterbegin", icon(node.dataset.icon)));

// Only allow redirects to admin pages in this folder.
const nextPage = /^[a-z]+\.html$/i.test(params.get("next") || "") ? params.get("next") : "dashboard.html";

if (isAuthenticated()) {
    window.location.replace(nextPage);
}

if (params.get("reason") === "expired") {
    showMessage("Your session has expired. Please sign in again.", "info");
} else if (params.get("reason") === "logout") {
    showMessage("You have been signed out.", "success");
}

document.getElementById("togglePassword").addEventListener("click", event => {
    const input = document.getElementById("password");
    const visible = input.type === "text";
    input.type = visible ? "password" : "text";
    event.currentTarget.innerHTML = icon(visible ? "eye" : "eyeOff");
    event.currentTarget.setAttribute("aria-label", visible ? "Show password" : "Hide password");
    event.currentTarget.setAttribute("aria-pressed", String(!visible));
});

loginForm.addEventListener("submit", login);

function showMessage(text, type) {
    message.textContent = text;
    message.className = `form-message ${type}`;
}

async function login(e) {

    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        showMessage("Enter your email address and password.", "error");
        return;
    }

    const button = loginForm.querySelector("button[type=submit]");
    Admin.setBusy(button, true, "Signing in…");
    showMessage("Signing in… the server may take a moment to wake up.", "info");

    const data = await apiRequest("/auth/login", "POST", { email, password });

    if (!data || !data.success || !data.token) {
        Admin.setBusy(button, false);
        showMessage(data?.message || "Invalid email or password.", "error");
        document.getElementById("password").select();
        return;
    }

    localStorage.setItem("token", data.token);

    localStorage.setItem(
        "administrator",
        JSON.stringify(data.administrator)
    );

    showMessage("Signed in. Redirecting…", "success");

    window.location.replace(nextPage);

}
