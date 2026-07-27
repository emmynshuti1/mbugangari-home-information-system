document.addEventListener("DOMContentLoaded", async () => {

    loadStatistics();

    loadFeaturedRooms();

    loadLatestHistory();

    loadHomeDescription();

});

async function loadStatistics() {

    const rooms = await getRooms();
    const gallery = await getGallery();
    const materials = await getMaterials();
    const places = await getNearbyPlaces();

    document.getElementById("roomCount").textContent =
        rooms?.count || 0;

    document.getElementById("galleryCount").textContent =
        gallery?.count || 0;

    document.getElementById("materialCount").textContent =
        materials?.count || 0;

    document.getElementById("placeCount").textContent =
        places?.count || 0;

}

async function loadFeaturedRooms() {

    const result = await getRooms();

    const container = document.getElementById("featuredRooms");

    container.innerHTML = "";

    if (!result || result.count === 0) {

        const message = document.createElement("p");
        message.textContent = "No rooms available.";

        container.appendChild(message);

        return;

    }

    result.data.slice(0, 3).forEach(room => {

        const card = document.createElement("div");
        card.className = "room-card";

        const title = document.createElement("h3");
        title.textContent = room.name;

        const floor = document.createElement("p");

        const floorLabel = document.createElement("strong");
        floorLabel.textContent = "Floor: ";

        floor.appendChild(floorLabel);
        floor.append(room.floor || "N/A");

        const description = document.createElement("p");
        description.textContent = room.description || "";

        card.appendChild(title);
        card.appendChild(floor);
        card.appendChild(description);

        container.appendChild(card);

    });

}

async function loadLatestHistory() {

    const result = await getHistory();

    const container = document.getElementById("latestHistory");

    container.innerHTML = "";

    if (!result || result.count === 0) {

        const message = document.createElement("p");
        message.textContent = "No history available.";

        container.appendChild(message);

        return;

    }

    const history = result.data[0];

    const title = document.createElement("h3");
    title.textContent = history.title;

    const description = document.createElement("p");
    description.textContent = history.description;

    const date = document.createElement("small");
    date.textContent = history.event_date;

    container.appendChild(title);
    container.appendChild(description);
    container.appendChild(date);

}

async function loadHomeDescription(){

    const result= await getHouse();

    if(result && result.count>0){

        document.getElementById("homeDescription").textContent=

        result.data[0].description;

    }

}