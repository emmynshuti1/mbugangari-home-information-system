let rooms = [];

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadRooms();

        loadHouseOptions("room_house_id", ".field-note");

        document
            .getElementById("searchRoom")
            ?.addEventListener("keyup", searchRooms);

        document
            .getElementById("addRoomBtn")
            ?.addEventListener("click", () => showRoomForm());

        document
            .getElementById("cancelRoomBtn")
            ?.addEventListener("click", hideRoomForm);

        document
            .getElementById("roomForm")
            ?.addEventListener("submit", saveRoom);

    });

});

async function loadRooms() {

    try {

        const response = await getRooms();

        if (!response.success) {

            showMessage(response.message, "error");

            return;

        }

        rooms = response.data || [];

        displayRooms(rooms);

    }

    catch (error) {

        console.error(error);

        showMessage("Unable to load rooms.", "error");

    }

}

function displayRooms(data) {

    const tbody = document.querySelector("#roomsTable tbody");

    tbody.innerHTML = "";

    if (data.length === 0) {

        const tr = document.createElement("tr");

        const td = document.createElement("td");

        td.colSpan = 6;

        td.textContent = "No rooms found.";

        td.style.textAlign = "center";

        tr.appendChild(td);

        tbody.appendChild(tr);

        return;

    }

    data.forEach(room => {

        const tr = document.createElement("tr");

        // ID
        const idTd = document.createElement("td");
        idTd.textContent = room.id;

        // Name
        const nameTd = document.createElement("td");
        nameTd.textContent = room.name;

        // Floor
        const floorTd = document.createElement("td");
        floorTd.textContent = room.floor || "-";

        // Size
        const sizeTd = document.createElement("td");
        sizeTd.textContent = `${room.length} × ${room.width}`;

        // Image
        const imageTd = document.createElement("td");

        const img = document.createElement("img");

        img.src = room.image_url;

        img.alt = room.name;

        img.width = 80;

        img.onerror = function () {

            this.src = "../images/no-image.jpg";

        };

        imageTd.appendChild(img);

        // Actions
        const actionsTd = document.createElement("td");

        const editBtn = document.createElement("button");

        editBtn.className = "editBtn";

        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => editRoom(room.id));

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "deleteBtn";

        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => removeRoom(room.id));

        actionsTd.appendChild(editBtn);

        actionsTd.appendChild(deleteBtn);

        tr.appendChild(idTd);
        tr.appendChild(nameTd);
        tr.appendChild(floorTd);
        tr.appendChild(sizeTd);
        tr.appendChild(imageTd);
        tr.appendChild(actionsTd);

        tbody.appendChild(tr);

    });

}

function searchRooms() {

    const keyword = document
        .getElementById("searchRoom")
        .value
        .toLowerCase();

    const filtered = rooms.filter(room =>

        room.name.toLowerCase().includes(keyword) ||

        (room.floor || "").toLowerCase().includes(keyword)

    );

    displayRooms(filtered);

}

function showRoomForm(room = null) {

    document
        .getElementById("roomFormCard")
        .classList
        .remove("hidden");

    if (room) {

        document.getElementById("roomFormTitle").textContent = "Edit Room";

        document.getElementById("roomId").value = room.id;

        document.getElementById("roomName").value = room.name || "";

        document.getElementById("roomFloor").value = room.floor || "";

        document.getElementById("roomLength").value = room.length || "";

        document.getElementById("roomWidth").value = room.width || "";

        document.getElementById("roomDescription").value = room.description || "";

        document.getElementById("roomImage").value = room.image_url || "";

        document.getElementById("room_house_id").value = room.house_id;

    }

    else {

        document.getElementById("roomFormTitle").textContent = "Add Room";

        document.getElementById("roomForm").reset();

        document.getElementById("roomId").value = "";

    }

    clearMessage();

}

function hideRoomForm() {

    document
        .getElementById("roomFormCard")
        .classList
        .add("hidden");

    clearMessage();

}

function showMessage(message, type = "success") {

    const box = document.getElementById("roomMessage");

    if (!box) return;

    box.textContent = message;

    box.className = `form-message ${type}`;

}

function clearMessage() {

    const box = document.getElementById("roomMessage");

    if (!box) return;

    box.textContent = "";

    box.className = "form-message";

}

async function saveRoom(e) {

    e.preventDefault();

    const id = document.getElementById("roomId").value;

    const room = {

        house_id: document.getElementById("room_house_id").value,

        name: document.getElementById("roomName").value.trim(),

        floor: document.getElementById("roomFloor").value.trim(),

        length: Number(document.getElementById("roomLength").value),

        width: Number(document.getElementById("roomWidth").value),

        description: document.getElementById("roomDescription").value.trim(),

        image_url: document.getElementById("roomImage").value.trim()

    };

    // Validation

    if (!room.house_id) {

        showMessage("Please select a house.", "error");

        return;

    }

    if (!room.name) {

        showMessage("Room name is required.", "error");

        return;

    }

    if (room.length <= 0 || room.width <= 0) {

        showMessage("Length and width must be greater than zero.", "error");

        return;

    }

    let response;

    if (id) {

        response = await updateRoom(id, room);

    }

    else {

        response = await createRoom(room);

    }

    if (response.success) {

        hideRoomForm();

        await loadRooms();

    }

    else {

        showMessage(response.message || "Unable to save room.", "error");

    }

}

function editRoom(id) {

    const room = rooms.find(r => r.id === id);

    if (!room) return;

    showRoomForm(room);

}

async function removeRoom(id) {

    const room = rooms.find(r => r.id === id);

    if (!room) return;

    const confirmed = window.confirm(

        `Delete "${room.name}"?\n\nThis action cannot be undone.`

    );

    if (!confirmed) return;

    const response = await deleteRoom(id);

    if (response.success) {

        await loadRooms();

    }

    else {

        showMessage(response.message || "Unable to delete room.", "error");

    }

}