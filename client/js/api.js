function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: "Bearer " + token } : {};
}

// Neutral inline placeholder: works offline and is allowed by the CSP.
const DEFAULT_IMAGE_URL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
    '<rect width="400" height="300" fill="#e7e1d6"/>' +
    '<path d="M150 170 200 128l50 42v52h-100z" fill="none" stroke="#9aa59e" stroke-width="8" stroke-linejoin="round"/>' +
    '<path d="M188 222v-30h24v30" fill="none" stroke="#9aa59e" stroke-width="8" stroke-linejoin="round"/>' +
    "</svg>"
);

const REQUEST_TIMEOUT_MS = 60000;

function normalizeImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
        return DEFAULT_IMAGE_URL;
    }

    if (/^(https?:|data:image\/|blob:)/i.test(imageUrl)) {
        return imageUrl;
    }

    if (/^\/api\//i.test(imageUrl)) {
        return CONFIG.API_ORIGIN + imageUrl;
    }

    if (/^\/?uploads\//i.test(imageUrl)) {
        return CONFIG.IMAGE_URL + "/" + imageUrl.replace(/^\/?uploads\//i, "");
    }

    // Legacy relative paths such as "images/kitchen.jpg" live in the client folder.
    return CONFIG.SITE_ROOT + imageUrl.replace(/^(\.\.\/)+|^\/+/, "");
}

function networkErrorMessage(error) {
    if (error && error.name === "AbortError") {
        return "The server took too long to respond. It may be waking up — please try again in a moment.";
    }

    return navigator.onLine === false
        ? "You appear to be offline. Check your connection and try again."
        : "Unable to reach the server. Please try again shortly.";
}

function handleUnauthorized(auth, status) {
    if (auth && status === 401) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
    }
}

// Multipart uploads go through XHR so callers can show upload progress.
function uploadWithProgress(url, method, formData, headers, onProgress) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.timeout = REQUEST_TIMEOUT_MS * 2;
        Object.entries(headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));

        xhr.upload.addEventListener("progress", event => {
            if (event.lengthComputable) onProgress(event.loaded / event.total);
        });

        xhr.addEventListener("load", () => {
            let data = null;
            try {
                data = JSON.parse(xhr.responseText);
            } catch (error) {
                data = null;
            }
            resolve({ status: xhr.status, ok: xhr.status >= 200 && xhr.status < 300, data });
        });

        xhr.addEventListener("error", () => resolve({ status: 0, ok: false, data: null, error: new Error("Network error") }));
        xhr.addEventListener("timeout", () => resolve({ status: 0, ok: false, data: null, error: { name: "AbortError" } }));

        xhr.send(formData);
    });
}

async function apiRequest(endpoint, method = "GET", body = null, auth = false, options = {}) {
    const headers = {};
    const config = {
        method,
        headers,
    };

    if (body !== null) {
        if (body instanceof FormData) {
            // Let the browser set the multipart boundary header.
            config.body = body;
        } else {
            headers["Content-Type"] = "application/json";
            config.body = JSON.stringify(body);
        }
    }

    if (auth) {
        Object.assign(headers, getAuthHeaders());
    }

    const url = CONFIG.API_URL + endpoint;

    if (body instanceof FormData && typeof options.onProgress === "function") {
        const result = await uploadWithProgress(url, method, body, headers, options.onProgress);

        if (result.error) {
            return { success: false, message: networkErrorMessage(result.error) };
        }

        handleUnauthorized(auth, result.status);

        if (!result.ok) {
            return result.data || { success: false, message: "Request failed (HTTP " + result.status + ")." };
        }

        return result.data || { success: true };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    config.signal = controller.signal;

    try {
        const response = await fetch(url, config);
        const data = await response.json().catch(() => null);

        handleUnauthorized(auth, response.status);

        if (!response.ok) {
            return data || {
                success: false,
                message: "Request failed (HTTP " + response.status + ").",
            };
        }

        return data;
    } catch (error) {
        // Network failures are reported to the user through the returned message.
        return {
            success: false,
            message: networkErrorMessage(error),
        };
    } finally {
        clearTimeout(timer);
    }
}

// Auth
async function getCurrentAdmin() {
    return await apiRequest("/auth/me", "GET", null, true);
}

async function getActivity(limit = 15) {
    return await apiRequest("/activity?limit=" + limit, "GET", null, true);
}

// Houses
async function getHouse() {
    return await apiRequest("/houses");
}

async function getHouseById(id) {
    return await apiRequest("/houses/" + id);
}

async function createHouse(houseData, options) {
    return await apiRequest("/houses", "POST", houseData, true, options);
}

async function updateHouse(id, houseData, options) {
    return await apiRequest("/houses/" + id, "PUT", houseData, true, options);
}

async function deleteHouse(id) {
    return await apiRequest("/houses/" + id, "DELETE", null, true);
}

// Rooms
async function getRooms() {
    return await apiRequest("/rooms");
}

async function getRoomById(id) {
    return await apiRequest("/rooms/" + id);
}

async function createRoom(roomData, options) {
    return await apiRequest("/rooms", "POST", roomData, true, options);
}

async function updateRoom(id, roomData, options) {
    return await apiRequest("/rooms/" + id, "PUT", roomData, true, options);
}

async function deleteRoom(id) {
    return await apiRequest("/rooms/" + id, "DELETE", null, true);
}

// Gallery
async function getGallery() {
    return await apiRequest("/gallery");
}

async function uploadGalleryImage(formData, options) {
    return await apiRequest("/gallery", "POST", formData, true, options);
}

async function updateGalleryImage(id, formData, options) {
    return await apiRequest("/gallery/" + id, "PUT", formData, true, options);
}

async function deleteGalleryImage(id) {
    return await apiRequest("/gallery/" + id, "DELETE", null, true);
}

// Materials
async function getMaterials() {
    return await apiRequest("/materials");
}

async function getMaterialById(id) {
    return await apiRequest("/materials/" + id);
}

async function createMaterial(materialData) {
    return await apiRequest("/materials", "POST", materialData, true);
}

async function updateMaterial(id, materialData) {
    return await apiRequest("/materials/" + id, "PUT", materialData, true);
}

async function deleteMaterial(id) {
    return await apiRequest("/materials/" + id, "DELETE", null, true);
}

// History
async function getHistory() {
    return await apiRequest("/history");
}

async function getHistoryById(id) {
    return await apiRequest("/history/" + id);
}

async function createHistory(historyData) {
    return await apiRequest("/history", "POST", historyData, true);
}

async function updateHistory(id, historyData) {
    return await apiRequest("/history/" + id, "PUT", historyData, true);
}

async function deleteHistory(id) {
    return await apiRequest("/history/" + id, "DELETE", null, true);
}

// Nearby Places
async function getNearbyPlaces() {
    return await apiRequest("/nearby-places");
}

async function getPlaceById(id) {
    return await apiRequest("/nearby-places/" + id);
}

async function createPlace(placeData) {
    return await apiRequest("/nearby-places", "POST", placeData, true);
}

async function updatePlace(id, placeData) {
    return await apiRequest("/nearby-places/" + id, "PUT", placeData, true);
}

async function deletePlace(id) {
    return await apiRequest("/nearby-places/" + id, "DELETE", null, true);
}
