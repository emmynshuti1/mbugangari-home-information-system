const CONFIG = (function createConfig() {
    const PRODUCTION_API = "https://mbugangari-home-api.onrender.com";
    const { protocol, hostname, port, origin } = window.location;
    const localHosts = new Set(["localhost", "127.0.0.1", ""]);
    const STATIC_DEV_PORTS = new Set(["5500", "5501", "5502", "8080", "8000"]);

    // The site root is derived from this script's own URL, so links and assets
    // resolve correctly whether the client folder is served at "/" (Express)
    // or under a sub-path (e.g. Live Server opened at the repository root).
    const scriptUrl = document.currentScript && document.currentScript.src;
    const siteRoot = scriptUrl ? scriptUrl.replace(/js\/config\.js(\?.*)?$/, "") : "/";

    let apiOrigin;
    if (window.MBUGANGARI_API_ORIGIN) {
        // Optional override for hosting the frontend somewhere else.
        apiOrigin = window.MBUGANGARI_API_ORIGIN;
    } else if (protocol === "file:") {
        apiOrigin = "http://localhost:5000";
    } else if (localHosts.has(hostname) && STATIC_DEV_PORTS.has(port)) {
        // Static dev servers (VS Code Live Server, etc.) talk to the API on 5000.
        apiOrigin = "http://localhost:5000";
    } else {
        // Served by the Express app (locally on any port, or deployed):
        // the website and the API share one origin.
        apiOrigin = origin;
    }

    return {
        API_ORIGIN: apiOrigin,
        API_URL: apiOrigin + "/api",
        IMAGE_URL: apiOrigin + "/uploads",
        SITE_ROOT: siteRoot,
        PRODUCTION_API
    };
})();
