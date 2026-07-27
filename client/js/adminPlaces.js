let placeItems = [];

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadPlaces();

        loadHouseOptions("house_id", ".field-note");

        document
            .getElementById("placeForm")
            ?.addEventListener("submit", savePlace);

        document
            .getElementById("searchPlace")
            ?.addEventListener("keyup", searchPlaces);

        document
            .getElementById("addPlaceBtn")
            ?.addEventListener("click", () => {

                showPlaceForm();

            });

        document
            .getElementById("cancelPlaceBtn")
            ?.addEventListener("click", hidePlaceForm);

    });

});

async function loadPlaces() {

    try {

        const response = await getNearbyPlaces();

        if (!response.success) {

            showToast(response.message, "error");

            return;

        }

        placeItems = response.data || [];

        renderPlaces(placeItems);

    }

    catch (error) {

        console.error(error);

        showToast("Unable to load nearby places.", "error");

    }

}

function showPlaceForm(place = null) {

    document
        .getElementById("placeFormCard")
        .classList
        .remove("hidden");

    if (place) {

        document.getElementById("placeFormTitle").textContent = "Edit Nearby Place";

        document.getElementById("placeId").value = place.id;

        document.getElementById("name").value = place.name;

        document.getElementById("category").value = place.category || "";

        document.getElementById("distance_meters").value = place.distance_meters || "";

        document.getElementById("description").value = place.description || "";

        document.getElementById("house_id").value = place.house_id;

    }

    else {

        document.getElementById("placeFormTitle").textContent = "Add Nearby Place";

        document.getElementById("placeForm").reset();

        document.getElementById("placeId").value = "";

    }

}

function hidePlaceForm() {

    document
        .getElementById("placeFormCard")
        .classList
        .add("hidden");

}

function renderPlaces(items) {

    const container = document.getElementById("placesTable");

    container.innerHTML = "";

    if (!items.length) {

        container.textContent = "No nearby places available.";

        return;

    }

    const table = document.createElement("table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Distance</th>
                <th>Actions</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");

    items.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.name}</td>
            <td>${item.category || ""}</td>
            <td>${item.distance_meters} m</td>
        `;

        const actions = document.createElement("td");

        const edit = document.createElement("button");

        edit.className = "editBtn";

        edit.textContent = "Edit";

        edit.onclick = () => showPlaceForm(item);

        const del = document.createElement("button");

        del.className = "deleteBtn";

        del.textContent = "Delete";

        del.onclick = () => deletePlaceEntry(item.id);

        actions.append(edit, del);

        tr.appendChild(actions);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    container.appendChild(table);

}

async function savePlace(e) {

    e.preventDefault();

    const id = document.getElementById("placeId").value;

    const place = {

        house_id: document.getElementById("house_id").value,

        name: document.getElementById("name").value.trim(),

        category: document.getElementById("category").value.trim(),

        distance_meters: document.getElementById("distance_meters").value,

        description: document.getElementById("description").value.trim()

    };

    if (!place.house_id) {

        showToast("Select a house.", "error");

        return;

    }

    if (!place.name) {

        showToast("Place name is required.", "error");

        return;

    }

    let response;

    if (id) {

        response = await updatePlace(id, place);

    }

    else {

        response = await createPlace(place);

    }

    if (!response.success) {

        showToast(response.message, "error");

        return;

    }

    hidePlaceForm();

    showToast("Nearby place saved.");

    loadPlaces();

}

function searchPlaces() {

    const keyword = document
        .getElementById("searchPlace")
        .value
        .toLowerCase();

    renderPlaces(

        placeItems.filter(item =>

            item.name.toLowerCase().includes(keyword) ||

            (item.category || "").toLowerCase().includes(keyword)

        )

    );

}

async function deletePlaceEntry(id) {

    const confirmed = await confirmAction(

        "Delete this nearby place?"

    );

    if (!confirmed) return;

    const response = await deletePlace(id);

    if (!response.success) {

        showToast(response.message, "error");

        return;

    }

    showToast("Nearby place deleted.");

    loadPlaces();

}