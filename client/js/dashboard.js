document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        displayAdministrator();
        loadStatistics();
    });
});

// Display administrator name
function displayAdministrator() {

    const admin = getAdministrator();

    if (admin) {

        document.getElementById("adminName").textContent =
            `Welcome, ${admin.full_name}`;

    }

}

// Load dashboard statistics
async function loadStatistics() {

    try {

        const [
            rooms,
            gallery,
            materials,
            history,
            places
        ] = await Promise.all([

            getRooms(),
            getGallery(),
            getMaterials(),
            getHistory(),
            getNearbyPlaces()

        ]);

        document.getElementById("roomCount").textContent =
            rooms.success ? rooms.data.length : 0;

        document.getElementById("galleryCount").textContent =
            gallery.success ? gallery.data.length : 0;

        document.getElementById("materialCount").textContent =
            materials.success ? materials.data.length : 0;

        document.getElementById("historyCount").textContent =
            history.success ? history.data.length : 0;

        document.getElementById("placeCount").textContent =
            places.success ? places.data.length : 0;

    }

    catch (error) {

        console.error("Dashboard Error:", error);

        alert("Unable to load dashboard statistics.");

    }

}