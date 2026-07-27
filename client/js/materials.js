let allMaterials = [];

document.addEventListener("DOMContentLoaded", () => {

    loadMaterials();

    document
        .getElementById("searchMaterial")
        .addEventListener("keyup", searchMaterials);

});

async function loadMaterials() {

    const loading = document.getElementById("loading");

    try {

        const response = await getMaterials();

        if (!response || !response.success) {

            loading.textContent = "Unable to load construction materials.";

            return;

        }

        allMaterials = response.data;

        loading.style.display = "none";

        displayMaterials(allMaterials);

    }

    catch (error) {

        console.error(error);

        loading.textContent = "Failed to connect to the server.";

    }

}


function displayMaterials(materials) {

    const container = document.getElementById("materialsContainer");

    container.innerHTML = "";

    if (materials.length === 0) {

        const empty = document.createElement("div");
        empty.className = "no-materials";
        empty.textContent = "No construction materials found.";

        container.appendChild(empty);

        return;

    }

    materials.forEach(material => {

        const card = document.createElement("div");
        card.className = "material-card";

        const title = document.createElement("h2");
        title.textContent = material.component || "Unknown Component";

        const materialName = document.createElement("div");
        materialName.className = "material-name";
        materialName.textContent =
            material.material_name || "Unknown Material";

        const description = document.createElement("p");
        description.textContent =
            material.description || "No description available.";

        card.appendChild(title);
        card.appendChild(materialName);
        card.appendChild(description);

        container.appendChild(card);

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