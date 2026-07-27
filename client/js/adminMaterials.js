let materialItems = [];

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadMaterials();

        loadHouseOptions("house_id", ".field-note");

        document
            .getElementById("materialForm")
            ?.addEventListener("submit", saveMaterial);

        document
            .getElementById("searchMaterial")
            ?.addEventListener("keyup", searchMaterials);

        document
            .getElementById("addMaterialBtn")
            ?.addEventListener("click", () => {

                showMaterialForm();

            });

        document
            .getElementById("cancelMaterialBtn")
            ?.addEventListener("click", hideMaterialForm);

    });

});

async function loadMaterials() {

    try {

        const response = await getMaterials();

        if (!response.success) {

            showToast(
                response.message || "Unable to load materials.",
                "error"
            );

            return;

        }

        materialItems = response.data || [];

        renderMaterials(materialItems);

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to load materials.",
            "error"
        );

    }

}

function showMaterialForm(material = null) {

    document
        .getElementById("materialFormCard")
        .classList
        .remove("hidden");

    if (material) {

        document.getElementById("materialFormTitle").textContent =
            "Edit Material";

        document.getElementById("materialId").value =
            material.id;

        document.getElementById("component").value =
            material.component;

        document.getElementById("material_name").value =
            material.material_name;

        document.getElementById("description").value =
            material.description || "";

        document.getElementById("house_id").value =
            material.house_id;

    }

    else {

        document.getElementById("materialFormTitle").textContent =
            "Add Material";

        document.getElementById("materialForm").reset();

        document.getElementById("materialId").value = "";

    }

}

function hideMaterialForm() {

    document
        .getElementById("materialFormCard")
        .classList
        .add("hidden");

}

function renderMaterials(items) {

    const container = document.getElementById("materialsTable");

    container.innerHTML = "";

    if (!items.length) {

        const empty = document.createElement("div");

        empty.className = "empty-state";

        empty.textContent = "No materials available.";

        container.appendChild(empty);

        return;

    }

    const table = document.createElement("table");

    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Component</th>
                <th>Material</th>
                <th>Description</th>
                <th>Actions</th>
            </tr>
        </thead>
    `;

    const tbody = document.createElement("tbody");

    items.forEach(item => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${item.id}</td>
            <td>${item.component}</td>
            <td>${item.material_name}</td>
            <td>${item.description || "—"}</td>
        `;

        const actionTd = document.createElement("td");

        const editBtn = document.createElement("button");

        editBtn.className = "editBtn";

        editBtn.textContent = "Edit";

        editBtn.addEventListener("click", () => {

            showMaterialForm(item);

        });

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "deleteBtn";

        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {

            deleteMaterialItem(item.id);

        });

        actionTd.appendChild(editBtn);

        actionTd.appendChild(deleteBtn);

        tr.appendChild(actionTd);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    container.appendChild(table);

}

async function saveMaterial(event) {

    event.preventDefault();

    const id = document.getElementById("materialId").value;

    const material = {

        house_id: document.getElementById("house_id").value,

        component: document
            .getElementById("component")
            .value
            .trim(),

        material_name: document
            .getElementById("material_name")
            .value
            .trim(),

        description: document
            .getElementById("description")
            .value
            .trim()

    };

    if (!material.house_id) {

        showToast(
            "Please select a house.",
            "error"
        );

        return;

    }

    if (!material.component) {

        showToast(
            "Component is required.",
            "error"
        );

        return;

    }

    if (!material.material_name) {

        showToast(
            "Material name is required.",
            "error"
        );

        return;

    }

    let response;

    if (id) {

        response = await updateMaterial(id, material);

    }

    else {

        response = await createMaterial(material);

    }

    if (!response.success) {

        showToast(
            response.message || "Unable to save material.",
            "error"
        );

        return;

    }

    hideMaterialForm();

    showToast("Material saved successfully.");

    loadMaterials();

}

function searchMaterials() {

    const query = document
        .getElementById("searchMaterial")
        .value
        .toLowerCase();

    const filtered = materialItems.filter(item =>

        item.component.toLowerCase().includes(query) ||

        item.material_name.toLowerCase().includes(query) ||

        (item.description || "")
            .toLowerCase()
            .includes(query)

    );

    renderMaterials(filtered);

}

async function deleteMaterialItem(id) {

    const confirmed = await confirmAction(

        "Delete this material? This action cannot be undone."

    );

    if (!confirmed) return;

    const response = await deleteMaterial(id);

    if (!response.success) {

        showToast(
            response.message || "Unable to delete material.",
            "error"
        );

        return;

    }

    showToast("Material deleted.");

    loadMaterials();

}