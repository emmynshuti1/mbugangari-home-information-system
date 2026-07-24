let houseId = null;

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadHouse();
        document.getElementById("houseForm")?.addEventListener("submit", saveHouse);
    });
});

async function loadHouse() {

    try {

        const response = await getHouse();

        if (!response.success || response.data.length === 0) {

            alert("No house information found.");

            return;

        }

        const house = response.data[0];

        houseId = house.id;

        document.getElementById("name").value = house.name || "";
        document.getElementById("owner").value = house.owner || "";
        document.getElementById("description").value = house.description || "";
        document.getElementById("year_built").value = house.year_built || "";
        document.getElementById("village").value = house.village || "";
        document.getElementById("sector").value = house.sector || "";
        document.getElementById("district").value = house.district || "";
        document.getElementById("province").value = house.province || "";
        document.getElementById("country").value = house.country || "";
        document.getElementById("latitude").value = house.latitude || "";
        document.getElementById("longitude").value = house.longitude || "";

    }

    catch (error) {

        console.error(error);

        alert("Unable to load house information.");

    }

}

async function saveHouse(e) {

    e.preventDefault();

    if (!houseId) {

        alert("House ID not found.");

        return;

    }

    const houseData = {

        name: document.getElementById("name").value,
        owner: document.getElementById("owner").value,
        description: document.getElementById("description").value,
        year_built: document.getElementById("year_built").value,
        village: document.getElementById("village").value,
        sector: document.getElementById("sector").value,
        district: document.getElementById("district").value,
        province: document.getElementById("province").value,
        country: document.getElementById("country").value,
        latitude: document.getElementById("latitude").value,
        longitude: document.getElementById("longitude").value

    };

    try {

        const response = await updateHouse(houseId, houseData);

        if (response.success) {

            alert("House information updated successfully.");

        }

        else {

            alert(response.message);

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to update house.");

    }

}