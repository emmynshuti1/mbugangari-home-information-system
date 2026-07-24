function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return token ? { Authorization: 'Bearer ' + token } : {};
}

const DEFAULT_IMAGE_URL = "https://via.placeholder.com/400x250?text=No+Image";

function normalizeImageUrl(imageUrl) {
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim() === "") {
        return DEFAULT_IMAGE_URL;
    }

    if (/^https?:\/\//i.test(imageUrl)) {
        return imageUrl;
    }

    if (/^\/?uploads\//i.test(imageUrl)) {
        return CONFIG.IMAGE_URL + '/' + imageUrl.replace(/^\/?uploads\//i, "");
    }

    return '../' + imageUrl.replace(/^\/+/, "");
}

async function apiRequest(endpoint, method = "GET", body = null, auth = false) {
    const headers = {};
    const config = {
        method,
        headers,
    };

    if (body !== null) {
        if (body instanceof FormData) {
            config.body = body;
        } else {
            headers["Content-Type"] = "application/json";
            config.body = JSON.stringify(body);
        }
    }

    if (auth) {
        Object.assign(headers, getAuthHeaders());
    }

    try {
        const response = await fetch(CONFIG.API_URL + endpoint, config);
        const data = await response.json().catch(() => null);

        if (!response.ok) {
            return data || {
                success: false,
                message: "HTTP Error: " + response.status,
            };
        }

        return data;
    } catch (error) {
        console.error(error);
        return {
            success: false,
            message: error.message,
        };
    }
}

// Houses
async function getHouse() {
    return await apiRequest("/houses");
}

async function getHouseById(id) {
    return await apiRequest("/houses/" + id);
}

async function createHouse(houseData) {
    return await apiRequest("/houses", "POST", houseData, true);
}

async function updateHouse(id, houseData) {
    return await apiRequest("/houses/" + id, "PUT", houseData, true);
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

async function createRoom(roomData) {
    return await apiRequest("/rooms", "POST", roomData, true);
}

async function updateRoom(id, roomData) {
    return await apiRequest("/rooms/" + id, "PUT", roomData, true);
}

async function deleteRoom(id) {
    return await apiRequest("/rooms/" + id, "DELETE", null, true);
}

// Gallery
async function getGallery() {
    return await apiRequest("/gallery");
}

async function uploadGalleryImage(formData) {
    return await apiRequest("/gallery/upload", "POST", formData, true);
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
    console.log("Creating history entry:", historyData);
    return await apiRequest("/history", "POST", historyData, true);
}

async function updateHistory(id, historyData) {
    console.log("Updating history entry:", historyData);
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
