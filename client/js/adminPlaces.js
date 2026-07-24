let placeItems = [];

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadPlaces();
        loadHouseOptions("house_id", ".field-note");
        document.getElementById("placeForm")?.addEventListener("submit", handleAddPlace);
        document.getElementById("searchPlace")?.addEventListener("keyup", searchPlaces);
    });
});

async function loadPlaces() {
    const response = await getNearbyPlaces();
    if (!response.success) {
        alert(response.message || "Unable to load nearby places.");
        return;
    }
    placeItems = response.data;
    renderPlaces(placeItems);
}

function renderPlaces(items) {
    const container = document.getElementById("placesTable");
    container.innerHTML = "";
    if (!items.length) {
        container.innerHTML = `<div class="empty-state">No nearby places have been added yet.</div>`;
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Distance (m)</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.name}</td>
                        <td>${item.category || "—"}</td>
                        <td>${item.description || "—"}</td>
                        <td>${item.distance_meters !== null && item.distance_meters !== undefined ? item.distance_meters : "—"}</td>
                        <td>
                            <button class="editBtn" onclick="editPlace(${item.id})">Edit</button>
                            <button class="deleteBtn" onclick="deletePlaceItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;
}

async function handleAddPlace(event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const category = document.getElementById("category").value.trim();
    const description = document.getElementById("description").value.trim();
    const distance_meters = Number(document.getElementById("distance_meters").value);

    if (!name) {
        alert("Name is required.");
        return;
    }

    const house_id = getSelectedHouseId("house_id");
    if (!house_id) {
        alert("Please select a house before adding a nearby place.");
        return;
    }

    const response = await createPlace({ house_id, name, category, description, distance_meters });
    if (!response.success) {
        alert(response.message || "Unable to add place.");
        return;
    }

    document.getElementById("placeForm").reset();
    loadPlaces();
}

function searchPlaces() {
    const query = document.getElementById("searchPlace").value.toLowerCase();
    const filtered = placeItems.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        String(item.distance_meters || "").toLowerCase().includes(query)
    );
    renderPlaces(filtered);
}

async function editPlace(id) {
    const place = placeItems.find(item => item.id === id);
    if (!place) return;

    const name = prompt("Name", place.name);
    if (name === null) return;
    const category = prompt("Category", place.category || "") || "";
    const description = prompt("Description", place.description || "") || "";
    const distance_meters = prompt("Distance (meters)", place.distance_meters || "") || "";

    const response = await updatePlace(id, { house_id: place.house_id, name, category, distance_meters: Number(distance_meters), description });
    if (!response.success) {
        alert(response.message || "Unable to update place.");
        return;
    }

    loadPlaces();
}

async function deletePlaceItem(id) {
    if (!confirm("Delete this place?")) {
        return;
    }

    const response = await deletePlace(id);
    if (!response.success) {
        alert(response.message || "Unable to delete place.");
        return;
    }

    loadPlaces();
}
