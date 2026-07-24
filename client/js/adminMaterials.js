let materialItems = [];

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadMaterials();
        loadHouseOptions("house_id", ".field-note");
        document.getElementById("materialForm")?.addEventListener("submit", handleAddMaterial);
        document.getElementById("searchMaterial")?.addEventListener("keyup", searchMaterials);
    });
});

async function loadMaterials() {
    const response = await getMaterials();
    if (!response.success) {
        alert(response.message || "Unable to load materials.");
        return;
    }
    materialItems = response.data;
    renderMaterials(materialItems);
}

function renderMaterials(items) {
    const container = document.getElementById("materialsTable");
    container.innerHTML = "";
    if (!items.length) {
        container.innerHTML = `<div class="empty-state">No materials available.</div>`;
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Component</th>
                    <th>Material</th>
                    <th>Description</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td>${item.component}</td>
                        <td>${item.material_name}</td>
                        <td>${item.description || "—"}</td>
                        <td>
                            <button class="editBtn" onclick="editMaterial(${item.id})">Edit</button>
                            <button class="deleteBtn" onclick="deleteMaterialItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;
}

async function handleAddMaterial(event) {
    event.preventDefault();
    const component = document.getElementById("component").value.trim();
    const material_name = document.getElementById("material_name").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!component) {
        alert("Component is required.");
        return;
    }

    if (!material_name) {
        alert("Material name is required.");
        return;
    }

    const house_id = getSelectedHouseId("house_id");
    if (!house_id) {
        alert("Please select a house before adding material.");
        return;
    }

    const response = await createMaterial({ house_id, component, material_name, description });
    if (!response.success) {
        alert(response.message || "Unable to add material.");
        return;
    }

    document.getElementById("materialForm").reset();
    loadMaterials();
}

function searchMaterials() {
    const query = document.getElementById("searchMaterial").value.toLowerCase();
    const filtered = materialItems.filter(item =>
        item.component.toLowerCase().includes(query) ||
        item.material_name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
    renderMaterials(filtered);
}

async function editMaterial(id) {
    const material = materialItems.find(item => item.id === id);
    if (!material) return;

    const component = prompt("Component", material.component || "");
    if (component === null) return;
    const material_name = prompt("Material Name", material.material_name || "");
    if (material_name === null) return;
    const description = prompt("Description", material.description || "") || "";

    const response = await updateMaterial(id, {
        house_id: material.house_id,
        component,
        material_name,
        description
    });
    if (!response.success) {
        alert(response.message || "Unable to update material.");
        return;
    }

    loadMaterials();
}

async function deleteMaterialItem(id) {
    if (!confirm("Delete this material?")) {
        return;
    }

    const response = await deleteMaterial(id);
    if (!response.success) {
        alert(response.message || "Unable to delete material.");
        return;
    }

    loadMaterials();
}
