const CONFIG = (function createConfig() {
    const { protocol, hostname, port, origin } = window.location;
    const localHosts = new Set(["localhost", "127.0.0.1"]);
    const servedByApi = protocol !== "file:" && (
        port === "5000" ||
        (!localHosts.has(hostname) && hostname !== "")
    );

    let apiOrigin;
    if (servedByApi) {
        apiOrigin = origin;
    } else if (localHosts.has(hostname) || protocol === "file:") {
        apiOrigin = "http://localhost:5000";
    } else {
        apiOrigin = "https://mbugangari-home-api.onrender.com";
    }

    return {
        API_URL: apiOrigin + "/api",
        IMAGE_URL: apiOrigin + "/uploads"
    };
})();
