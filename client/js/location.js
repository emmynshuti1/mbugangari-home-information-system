let allPlaces = [];

document.addEventListener("DOMContentLoaded", () => {

    loadNearbyPlaces();

    document
        .getElementById("searchPlace")
        .addEventListener("keyup", searchPlaces);

});

async function loadNearbyPlaces() {

    const loading = document.getElementById("loading");

    try {

        const response = await getNearbyPlaces();

        if (!response || !response.success) {

            loading.textContent = "Unable to load nearby places.";

            return;

        }

        allPlaces = response.data;

        loading.style.display = "none";

        displayPlaces(allPlaces);

    }

    catch (error) {

        console.error(error);

        loading.textContent = "Failed to connect to the server.";

    }

}

function displayPlaces(places) {

    const container = document.getElementById("placesContainer");

    container.innerHTML = "";

    if (places.length === 0) {

        const empty = document.createElement("div");
        empty.className = "no-places";
        empty.textContent = "No nearby places found.";

        container.appendChild(empty);

        return;

    }

    places.forEach(place => {

        const card = document.createElement("div");
        card.className = "place-card";

        const title = document.createElement("h2");
        title.textContent = place.name || "Unknown Place";

        const badges = document.createElement("div");
        badges.className = "badges";

        const category = document.createElement("span");
        category.className = "category";
        category.textContent = place.category || "General";

        const distance = document.createElement("span");
        distance.className = "distance";
        distance.textContent = `${place.distance_meters || 0} meters`;

        badges.appendChild(category);
        badges.appendChild(distance);

        const description = document.createElement("p");
        description.textContent =
            place.description || "No description available.";

        card.appendChild(title);
        card.appendChild(badges);
        card.appendChild(description);

        container.appendChild(card);

    });

}

function searchPlaces() {

    const keyword = document
        .getElementById("searchPlace")
        .value
        .toLowerCase();

    const filtered = allPlaces.filter(place =>

        place.name.toLowerCase().includes(keyword) ||

        (place.category &&
         place.category.toLowerCase().includes(keyword))

    );

    displayPlaces(filtered);

}