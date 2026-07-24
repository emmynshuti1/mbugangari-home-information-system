document.addEventListener("DOMContentLoaded", loadHouseInformation);

async function loadHouseInformation() {

    const loading = document.getElementById("loadingMessage");
    const container = document.getElementById("aboutContainer");

    try {

        const response = await getHouse();

        if (!response || !response.success) {

            loading.innerHTML = "Unable to load house information.";

            return;

        }

        if (response.data.length === 0) {

            loading.innerHTML = "No house information found.";

            return;

        }

        const house = response.data[0];

        document.getElementById("houseName").textContent =
            house.name || "N/A";

        document.getElementById("houseOwner").textContent =
            house.owner || "N/A";

        document.getElementById("houseYear").textContent =
            house.year_built || "N/A";

        document.getElementById("houseDescription").textContent =
            house.description || "No description available.";

        document.getElementById("houseVillage").textContent =
            house.village || "N/A";

        document.getElementById("houseSector").textContent =
            house.sector || "N/A";

        document.getElementById("houseDistrict").textContent =
            house.district || "N/A";

        document.getElementById("houseProvince").textContent =
            house.province || "N/A";

        document.getElementById("houseCountry").textContent =
            house.country || "N/A";

        document.getElementById("houseLatitude").textContent =
            house.latitude ?? "N/A";

        document.getElementById("houseLongitude").textContent =
            house.longitude ?? "N/A";

        loading.style.display = "none";
        container.style.display = "block";

    } catch (error) {

        console.error("Error:", error);

        loading.innerHTML = `
            <p style="color:red;">
                Failed to connect to the server.
            </p>
        `;

    }

}