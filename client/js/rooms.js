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

            loading.innerHTML = "Unable to load rooms.";

            return;

        }

        allRooms = response.data;

        loading.style.display = "none";

        displayRooms(allRooms);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = "Server connection failed.";

    }

}

function displayRooms(rooms) {

    const container = document.getElementById("roomContainer");

    container.innerHTML = "";

    if (rooms.length === 0) {

        container.innerHTML = `
            <div class="no-rooms">
                No rooms found.
            </div>
        `;

        return;

    }

    rooms.forEach(room => {

        const image = room.image_url;

        const length = Number(room.length) || 0;
        const width = Number(room.width) || 0;

        const area = (length * width).toFixed(2);

        container.innerHTML += `

        <div class="room-card">

            <img
                src="../images/${image}"
                alt="${room.name}"
            >

            <div class="room-body">

                <h2>${room.name}</h2>

                <div class="floor">

                    ${room.floor || "Unknown Floor"}

                </div>

                <p>

                    <strong>Length:</strong>
                    ${length} m

                </p>

                <p>

                    <strong>Width:</strong>
                    ${width} m

                </p>

                <p class="area">

                    Area:
                    ${area} m²

                </p>

                <p>

                    ${room.description || "No description available."}

                </p>

            </div>

        </div>

        `;

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