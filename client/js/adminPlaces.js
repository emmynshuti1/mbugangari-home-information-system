// Nearby places management.
Admin.init(() => {
    AdminResource({
        key: "places",
        singular: "place",
        plural: "places",
        icon: "pin",
        publicUrl: "../pages/location.html",
        searchPlaceholder: "Search places by name or category…",
        api: { list: getNearbyPlaces, create: createPlace, update: updatePlace, remove: deletePlace },
        defaultSort: { key: "distance_meters", dir: "asc" },
        filters: [{ key: "category", label: "All categories" }],
        searchText: item => `${item.name} ${item.category || ""} ${item.description || ""}`,
        fields: [
            { name: "house_id", label: "House", type: "house", required: true },
            { name: "name", label: "Place name", required: true, maxlength: 100, placeholder: "e.g. Mbugangari Market" },
            { name: "category", label: "Category", maxlength: 50, placeholder: "e.g. Market", suggestions: ["Market", "Education", "Hospital", "Religion", "Transport"] },
            { name: "distance_meters", label: "Distance (metres)", type: "number", step: "1", min: 0, max: 1000000, integer: true, inputmode: "numeric" },
            { name: "description", label: "Description", type: "textarea", maxlength: 2000 }
        ],
        columns: [
            {
                label: "Place", key: "name", render: item => Admin.el("div", {},
                    Admin.el("span", { className: "cell-title", text: item.name }),
                    Admin.el("span", { className: "cell-sub", text: item.description || "No description" }))
            },
            { label: "Category", key: "category", render: item => item.category ? Admin.el("span", { className: "badge", text: item.category }) : "—" },
            {
                label: "Distance", key: "distance_meters", sortValue: item => item.distance_meters ?? Infinity,
                render: item => item.distance_meters === null || item.distance_meters === undefined ? "—" : `${Number(item.distance_meters).toLocaleString()} m`
            },
            { label: "ID", key: "id", sortValue: item => Number(item.id), render: item => `#${item.id}` }
        ],
        titleOf: item => item.name,
        formatValue: (name, value) => name === "distance_meters" && value !== null && value !== undefined ? `${Number(value).toLocaleString()} m` : value
    });
});
