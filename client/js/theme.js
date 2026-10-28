// Loaded in <head> so the theme is applied before the first paint.
(function () {
    const THEME_KEY = "theme";
    const root = document.documentElement;

    function readStored() {
        try {
            const stored = localStorage.getItem(THEME_KEY);
            return stored === "light" || stored === "dark" ? stored : null;
        } catch (error) {
            return null;
        }
    }

    function systemTheme() {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function updateToggles(theme) {
        document.querySelectorAll("[data-theme-toggle]").forEach(button => {
            const next = theme === "dark" ? "light" : "dark";
            button.setAttribute("aria-label", `Switch to ${next} theme`);
            button.title = `Switch to ${next} theme`;
            button.innerHTML = theme === "dark"
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
        });
    }

    function applyTheme(theme) {
        root.setAttribute("data-theme", theme);
        updateToggles(theme);
    }

    function toggleTheme() {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        try {
            localStorage.setItem(THEME_KEY, next);
        } catch (error) {
            // Storage unavailable: the choice lasts for this page only.
        }
        applyTheme(next);
    }

    applyTheme(readStored() || systemTheme());

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
        if (!readStored()) applyTheme(systemTheme());
    });

    document.addEventListener("DOMContentLoaded", () => {
        updateToggles(root.getAttribute("data-theme"));
        document.addEventListener("click", event => {
            if (event.target.closest("[data-theme-toggle]")) toggleTheme();
        });
    });
})();
