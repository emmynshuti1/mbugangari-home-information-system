const THEME_KEY = "theme";
const themeToggle = document.getElementById("themeToggle");

function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") {
        return stored;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
        themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
        themeToggle.title = theme === "dark" ? "Switch to light theme" : "Switch to dark theme";
    }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || getPreferredTheme();
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
}

if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
}

applyTheme(getPreferredTheme());
