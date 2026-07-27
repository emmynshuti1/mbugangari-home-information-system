let allRooms = [];

document.addEventListener("DOMContentLoaded", () => {

    loadRooms();

    document
        .getElementById("searchRoom")
        .addEventListener("keyup", searchRooms);

});

async function loadRooms() {

    const loading = document.getElementById("loading");
    const container = document.getElementById("roomContainer");

    try {

        const response = await getRooms();

        if (!response || !response.success) { 

            loading.textContent = "Unable to load rooms.";

            return;

        }

        allRooms = response.data;

        loading.style.display = "none";

        displayRooms(allRooms);

    }

    catch (error) {

        console.error(error);

        loading.textContent = "Server connection failed.";

    }

}

function displayRooms(rooms) {

    const container = document.getElementById("roomContainer");

    container.innerHTML = "";

    if (rooms.length === 0) {

        const empty = document.createElement("div");
        empty.className = "no-rooms";
        empty.textContent = "No rooms found.";

        container.appendChild(empty);

        return;

    }

    rooms.forEach(room => {

        const length = Number(room.length) || 0;
        const width = Number(room.width) || 0;
        const area = (length * width).toFixed(2);

        const card = document.createElement("div");
        card.className = "room-card";

        const image = document.createElement("img");
        image.src = `../images/${room.image_url}`;
        image.alt = room.name || "Room";

        const body = document.createElement("div");
        body.className = "room-body";

        const title = document.createElement("h2");
        title.textContent = room.name || "Unnamed Room";

        const floor = document.createElement("div");
        floor.className = "floor";
        floor.textContent = room.floor || "Unknown Floor";

        const lengthP = document.createElement("p");
        const lengthStrong = document.createElement("strong");
        lengthStrong.textContent = "Length: ";
        lengthP.append(lengthStrong, `${length} m`);

        const widthP = document.createElement("p");
        const widthStrong = document.createElement("strong");
        widthStrong.textContent = "Width: ";
        widthP.append(widthStrong, `${width} m`);

        const areaP = document.createElement("p");
        areaP.className = "area";
        areaP.textContent = `Area: ${area} m²`;

        const description = document.createElement("p");
        description.textContent =
            room.description || "No description available.";

        body.appendChild(title);
        body.appendChild(floor);
        body.appendChild(lengthP);
        body.appendChild(widthP);
        body.appendChild(areaP);
        body.appendChild(description);

        card.appendChild(image);
        card.appendChild(body);

        container.appendChild(card);

    });

}
function searchRooms() {

    const keyword = document
        .getElementById("searchRoom")
        .value
        .toLowerCase();

    const filtered = allRooms.filter(room =>
        room.name.toLowerCase().includes(keyword)
    );

    displayRooms(filtered);

}