// Construction materials management.
Admin.init(() => {
    AdminResource({
        key: "materials",
        singular: "material",
        plural: "materials",
        icon: "brick",
        publicUrl: "../pages/materials.html",
        searchPlaceholder: "Search by component or material…",
        api: { list: getMaterials, create: createMaterial, update: updateMaterial, remove: deleteMaterial },
        defaultSort: { key: "id", dir: "asc" },
        filters: [{ key: "component", label: "All components" }],
        searchText: item => `${item.component} ${item.material_name} ${item.description || ""}`,
        fields: [
            { name: "house_id", label: "House", type: "house", required: true },
            { name: "component", label: "Component", required: true, maxlength: 100, placeholder: "e.g. Roof", suggestions: ["Foundation", "Walls", "Roof", "Doors", "Windows", "Floor", "Ceiling"] },
            { name: "material_name", label: "Material", required: true, maxlength: 100, placeholder: "e.g. Iron Sheets" },
            { name: "description", label: "Description", type: "textarea", maxlength: 2000 }
        ],
        columns: [
            { label: "Component", key: "component", render: item => Admin.el("span", { className: "badge", text: item.component }) },
            {
                label: "Material", key: "material_name", render: item => Admin.el("div", {},
                    Admin.el("span", { className: "cell-title", text: item.material_name }),
                    Admin.el("span", { className: "cell-sub", text: item.description || "No description" }))
            },
            { label: "ID", key: "id", sortValue: item => Number(item.id), render: item => `#${item.id}` }
        ],
        titleOf: item => `${item.component}: ${item.material_name}`
    });
});
