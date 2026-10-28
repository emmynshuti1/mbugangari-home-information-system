// Rooms management: name, floor, dimensions, description and photo.
const roomArea = room => (Number(room.length) > 0 && Number(room.width) > 0 ? Number(room.length) * Number(room.width) : null);

Admin.init(() => {
    AdminResource({
        key: "rooms",
        singular: "room",
        plural: "rooms",
        icon: "door",
        publicUrl: "../pages/rooms.html",
        multipart: true,
        searchPlaceholder: "Search rooms by name, floor or description…",
        api: { list: getRooms, create: createRoom, update: updateRoom, remove: deleteRoom },
        defaultSort: { key: "id", dir: "asc" },
        filters: [{ key: "floor", label: "All floors" }],
        searchText: room => `${room.name} ${room.floor || ""} ${room.description || ""}`,
        fields: [
            { name: "house_id", label: "House", type: "house", required: true },
            { name: "name", label: "Room name", required: true, maxlength: 100, placeholder: "e.g. Living Room" },
            { name: "floor", label: "Floor", maxlength: 50, placeholder: "e.g. Ground Floor", suggestions: ["Ground Floor", "First Floor"] },
            { name: "length", label: "Length (m)", type: "number", step: "0.01", min: 0.01, exclusiveMin: 0, max: 999.99, inputmode: "decimal" },
            { name: "width", label: "Width (m)", type: "number", step: "0.01", min: 0.01, exclusiveMin: 0, max: 999.99, inputmode: "decimal" },
            { name: "description", label: "Description", type: "textarea", maxlength: 2000 },
            { name: "image", label: "Room photo", type: "image", requiredOnCreate: true, hint: "Required for a new room. When editing, keep the current photo or choose Replace." }
        ],
        columns: [
            { label: "Photo", media: true, render: room => Admin.thumb(room.image_url, room.name) },
            {
                label: "Room", key: "name", render: room => Admin.el("div", {},
                    Admin.el("span", { className: "cell-title", text: room.name }),
                    Admin.el("span", { className: "cell-sub", text: room.description || "No description" }))
            },
            { label: "Floor", key: "floor", render: room => room.floor ? Admin.el("span", { className: "badge", text: room.floor }) : "—" },
            {
                label: "Size", key: "area", sortValue: room => roomArea(room) || 0,
                render: room => roomArea(room)
                    ? `${Number(room.length)} × ${Number(room.width)} m · ${roomArea(room).toFixed(1)} m²`
                    : "—"
            },
            { label: "ID", key: "id", sortValue: room => Number(room.id), render: room => `#${room.id}` }
        ],
        titleOf: room => room.name,
        formatValue: (name, value) => (name === "length" || name === "width") && value ? `${Number(value)} m` : value
    });
});
