let houseId = null;

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadHouse();

        document
            .getElementById("houseForm")
            ?.addEventListener("submit", saveHouse);

    });

});

async function loadHouse() {

    try {

        const response = await getHouse();

        if (!response.success || !response.data.length) {

            showToast(
                "No house information found.",
                "error"
            );

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

        showToast(
            "Unable to load house information.",
            "error"
        );

    }

}

async function saveHouse(event) {

    event.preventDefault();

    if (!houseId) {

        showToast(
            "House not found.",
            "error"
        );

        return;

    }

    const submitBtn = event.target.querySelector("button[type='submit']");

    submitBtn.disabled = true;

    const houseData = {

        name: document.getElementById("name").value.trim(),

        owner: document.getElementById("owner").value.trim(),

        description: document.getElementById("description").value.trim(),

        year_built: Number(document.getElementById("year_built").value),

        village: document.getElementById("village").value.trim(),

        sector: document.getElementById("sector").value.trim(),

        district: document.getElementById("district").value.trim(),

        province: document.getElementById("province").value.trim(),

        country: document.getElementById("country").value.trim(),

        latitude: document.getElementById("latitude").value,

        longitude: document.getElementById("longitude").value

    };

    try {

        const response = await updateHouse(

            houseId,

            houseData

        );

        if (!response.success) {

            showToast(

                response.message || "Unable to save changes.",

                "error"

            );

            return;

        }

        showToast(

            "House information updated successfully."

        );

    }

    catch (error) {

        console.error(error);

        showToast(

            "Unable to update house.",

            "error"

        );

    }

    finally {

        submitBtn.disabled = false;

    }

}