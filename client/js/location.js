let allPlaces = [];

document.addEventListener("DOMContentLoaded", () => {

    loadNearbyPlaces();

    document
        .getElementById("searchPlace")
        .addEventListener("keyup", searchPlaces);

});

async function loadNearbyPlaces() {

    const loading = document.getElementById("loading");
    const container = document.getElementById("placesContainer");

    try {

        const response = await getNearbyPlaces();

        if (!response || !response.success) {

            loading.innerHTML = "Unable to load nearby places.";

            return;

        }

        allPlaces = response.data;

        loading.style.display = "none";

        displayPlaces(allPlaces);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = "Failed to connect to the server.";

    }

}

function displayPlaces(places) {

    const container = document.getElementById("placesContainer");

    container.innerHTML = "";

    if (places.length === 0) {

        container.innerHTML = `
            <div class="no-places">
                No nearby places found.
            </div>
        `;

        return;

    }

    places.forEach(place => {

        container.innerHTML += `

        <div class="place-card">

            <h2>${place.name}</h2>

            <div class="badges">

                <span class="category">

                    ${place.category || "General"}

                </span>

                <span class="distance">

                    ${place.distance_meters} meters

                </span>

            </div>

            <p>

                ${place.description || "No description available."}

            </p>

        </div>

        `;

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