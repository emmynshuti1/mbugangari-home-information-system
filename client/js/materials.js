// Materials page: searchable list of construction materials by component.
const { el } = Site;

let allMaterials = [];

Site.ready(() => {
    document.getElementById("searchMaterial").addEventListener("input", displayMaterials);
    loadMaterials();
});

async function loadMaterials() {
    const container = document.getElementById("materialsContainer");
    Site.renderSkeletons(container, 6, "line");

    const response = await getMaterials();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", title: "Unable to load materials", message: response?.message, retry: loadMaterials });
        return;
    }

    allMaterials = response.data || [];
    displayMaterials();
}

function displayMaterials() {
    const container = document.getElementById("materialsContainer");
    const query = document.getElementById("searchMaterial").value.trim().toLowerCase();

    const materials = allMaterials.filter(material =>
        `${material.component} ${material.material_name} ${material.description || ""}`.toLowerCase().includes(query));

    document.getElementById("materialCount").textContent =
        `${materials.length} material${materials.length === 1 ? "" : "s"}${query ? " found" : ""}`;

    if (!materials.length) {
        Site.renderState(container, allMaterials.length
            ? { title: "No matching materials", message: "Try a different search." }
            : { title: "No materials yet", message: "Construction materials will appear here once they are added." });
        return;
    }

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...materials.map(material =>
        el("article", { className: "card material-card reveal" },
            el("span", { className: "material-icon", html: icon(Site.materialIcon(material.component)) }),
            el("span", { className: "component", text: material.component }),
            el("h3", { text: material.material_name }),
            material.description ? el("p", { text: material.description }) : null)));

    Site.reveal(container);
}
