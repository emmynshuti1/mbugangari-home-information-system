let allMaterials = [];

document.addEventListener("DOMContentLoaded", () => {

    loadMaterials();

    document
        .getElementById("searchMaterial")
        .addEventListener("keyup", searchMaterials);

});

async function loadMaterials() {

    const loading = document.getElementById("loading");
    const container = document.getElementById("materialsContainer");

    try {

        const response = await getMaterials();

        if (!response || !response.success) {

            loading.innerHTML = "Unable to load construction materials.";

            return;

        }

        allMaterials = response.data;

        loading.style.display = "none";

        displayMaterials(allMaterials);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = "Failed to connect to the server.";

    }

}

function displayMaterials(materials) {

    const container = document.getElementById("materialsContainer");

    container.innerHTML = "";

    if (materials.length === 0) {

        container.innerHTML = `
            <div class="no-materials">
                No construction materials found.
            </div>
        `;

        return;

    }

    materials.forEach(material => {

        container.innerHTML += `

        <div class="material-card">

            <h2>${material.component}</h2>

            <div class="material-name">

                ${material.material_name}

            </div>

            <p>

                ${material.description || "No description available."}

            </p>

        </div>

        `;

    });

}

function searchMaterials() {

    const keyword = document
        .getElementById("searchMaterial")
        .value
        .toLowerCase();

    const filtered = allMaterials.filter(material =>

        material.component.toLowerCase().includes(keyword) ||

        material.material_name.toLowerCase().includes(keyword)

    );

    displayMaterials(filtered);

}