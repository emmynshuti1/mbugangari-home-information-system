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

        setupRoomUpload();

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
       
        // Image

const imageTd = document.createElement("td");

const img = document.createElement("img");

img.src = normalizeImageUrl(room.image_url);

img.alt = room.name || "Room Image";

img.width = 80;

img.height = 60;

img.style.objectFit = "cover";

img.onerror = function () {

    this.src = DEFAULT_IMAGE_URL;

};

imageTd.appendChild(img);

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

        document
            .getElementById("roomFormTitle")
            .textContent = "Edit Room";

        document.getElementById("roomId").value =
            room.id;

        document.getElementById("roomName").value =
            room.name || "";

        document.getElementById("roomFloor").value =
            room.floor || "";

        document.getElementById("roomLength").value =
            room.length || "";

        document.getElementById("roomWidth").value =
            room.width || "";

        document.getElementById("roomDescription").value =
            room.description || "";

        document.getElementById("room_house_id").value =
            room.house_id;


        // Clear file input
        document.getElementById("roomImage").value = "";
        showRoomPreview(room.image_url, "Current image", "Current image — choose a new photo to replace it");

    }

    else {

        document
            .getElementById("roomFormTitle")
            .textContent = "Add Room";

        document
            .getElementById("roomForm")
            .reset();

        document.getElementById("roomId").value = "";
        clearRoomPreview();

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

    const houseId =
        document.getElementById("room_house_id").value;

    const name =
        document.getElementById("roomName").value.trim();

    const floor =
        document.getElementById("roomFloor").value.trim();

    const length =
        Number(document.getElementById("roomLength").value);

    const width =
        Number(document.getElementById("roomWidth").value);

    const description =
        document.getElementById("roomDescription").value.trim();

    const imageFile =
        document.getElementById("roomImage").files[0];


    // Validation

    if (!houseId) {

        showMessage("Please select a house.", "error");

        return;

    }


    if (!name) {

        showMessage("Room name is required.", "error");

        return;

    }


    if (length <= 0 || width <= 0) {

        showMessage(
            "Length and width must be greater than zero.",
            "error"
        );

        return;

    }


    // Create FormData

    const formData = new FormData();

    formData.append("house_id", houseId);

    formData.append("name", name);

    formData.append("floor", floor);

    formData.append("length", length);

    formData.append("width", width);

    formData.append("description", description);


    // Add image only if one was selected

    if (imageFile) {

        formData.append("image", imageFile);

    }


    let response;


    if (id) {

        response = await updateRoom(id, formData);

    } else {

        // Require image when creating a new room

        if (!imageFile) {

            showMessage(
                "Please select an image for the room.",
                "error"
            );

            return;

        }

        response = await createRoom(formData);

    }


    if (response.success) {

        const savedRoom = response.data;
        const existingIndex = rooms.findIndex(room => String(room.id) === String(savedRoom.id));

        if (existingIndex >= 0) {
            rooms[existingIndex] = { ...rooms[existingIndex], ...savedRoom };
        } else {
            rooms.push(savedRoom);
        }

        rooms.sort((first, second) => Number(first.id) - Number(second.id));
        displayRooms(rooms);
        hideRoomForm();

    } else {

        showMessage(
            response.message || "Unable to save room.",
            "error"
        );

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

function setupRoomUpload() {
    const input = document.getElementById("roomImage");
    const zone = document.getElementById("roomUploadZone");
    if (!input || !zone) return;

    input.addEventListener("change", () => previewRoomFile(input.files[0]));
    ["dragenter", "dragover"].forEach(event => zone.addEventListener(event, e => {
        e.preventDefault();
        zone.classList.add("is-dragging");
    }));
    ["dragleave", "drop"].forEach(event => zone.addEventListener(event, e => {
        e.preventDefault();
        zone.classList.remove("is-dragging");
    }));
    zone.addEventListener("drop", e => {
        const file = e.dataTransfer.files[0];
        if (!file) return;
        const transfer = new DataTransfer();
        transfer.items.add(file);
        input.files = transfer.files;
        previewRoomFile(file);
    });
    document.getElementById("clearRoomImage")?.addEventListener("click", clearRoomPreview);
}

function previewRoomFile(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
        showMessage("Please choose an image file.", "error");
        return;
    }
    const reader = new FileReader();
    reader.onload = () => showRoomPreview(reader.result, file.name, "New image ready to upload");
    reader.readAsDataURL(file);
}

function showRoomPreview(src, name, status) {
    const preview = document.getElementById("roomImagePreview");
    if (!preview || !src) return;
    document.getElementById("roomPreviewImage").src = normalizeImageUrl(src);
    document.getElementById("roomFileName").textContent = name;
    document.getElementById("roomUploadStatus").textContent = status;
    preview.classList.remove("hidden");
}

function clearRoomPreview() {
    const input = document.getElementById("roomImage");
    if (input) input.value = "";
    document.getElementById("roomImagePreview")?.classList.add("hidden");
}
