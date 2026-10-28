// Rooms page: search, floor filter, sorting, and a full-screen room viewer.
const { el } = Site;

let allRooms = [];
const filters = { search: "", floor: "all", sort: "default" };

Site.ready(() => {
    document.getElementById("searchRoom").addEventListener("input", event => {
        filters.search = event.target.value.trim().toLowerCase();
        displayRooms();
    });

    document.getElementById("sortRooms").addEventListener("change", event => {
        filters.sort = event.target.value;
        displayRooms();
    });

    loadRooms();
});

async function loadRooms() {
    const container = document.getElementById("roomContainer");
    Site.renderSkeletons(container, 6);

    const response = await getRooms();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", title: "Unable to load rooms", message: response?.message, retry: loadRooms });
        return;
    }

    allRooms = response.data || [];
    renderFloorFilters();
    displayRooms();
    openRoomFromHash();
}

function renderFloorFilters() {
    const floors = [...new Set(allRooms.map(room => room.floor).filter(Boolean))];
    const group = document.getElementById("floorFilters");

    if (floors.length < 2) {
        group.replaceChildren();
        return;
    }

    const chip = (value, label) => el("button", {
        className: "chip",
        type: "button",
        "aria-pressed": String(filters.floor === value),
        text: label,
        onclick: event => {
            filters.floor = value;
            group.querySelectorAll(".chip").forEach(button => button.setAttribute("aria-pressed", String(button === event.currentTarget)));
            displayRooms();
        }
    });

    group.replaceChildren(chip("all", "All floors"), ...floors.map(floor => chip(floor, floor)));
}

function filteredRooms() {
    const rooms = allRooms.filter(room => {
        const matchesFloor = filters.floor === "all" || room.floor === filters.floor;
        const haystack = `${room.name} ${room.description || ""} ${room.floor || ""}`.toLowerCase();
        return matchesFloor && haystack.includes(filters.search);
    });

    const byArea = (a, b) => (Site.roomArea(a) || 0) - (Site.roomArea(b) || 0);
    if (filters.sort === "name") rooms.sort((a, b) => a.name.localeCompare(b.name));
    if (filters.sort === "area-desc") rooms.sort((a, b) => byArea(b, a));
    if (filters.sort === "area-asc") rooms.sort(byArea);

    return rooms;
}

function viewerItem(room) {
    const area = Site.roomArea(room);
    const facts = [
        room.floor,
        area ? `${Site.formatNumber(room.length, 2)} × ${Site.formatNumber(room.width, 2)} m · ${Site.formatNumber(area, 1)} m²` : null
    ].filter(Boolean).join(" · ");

    return {
        src: room.image_url,
        title: room.name,
        text: [facts, room.description].filter(Boolean).join(" — ")
    };
}

function displayRooms() {
    const container = document.getElementById("roomContainer");
    const summary = document.getElementById("roomSummary");
    const rooms = filteredRooms();

    const totalArea = rooms.reduce((sum, room) => sum + (Site.roomArea(room) || 0), 0);
    summary.replaceChildren(
        el("span", {}, el("strong", { text: rooms.length }), ` room${rooms.length === 1 ? "" : "s"}`),
        totalArea ? el("span", {}, el("strong", { text: `${Site.formatNumber(totalArea, 1)} m²` }), " total floor area") : ""
    );

    if (!allRooms.length) {
        Site.renderState(container, { title: "No rooms yet", message: "Rooms will appear here once they are added." });
        return;
    }

    if (!rooms.length) {
        Site.renderState(container, { title: "No matching rooms", message: "Try a different search or floor." });
        return;
    }

    const items = rooms.map(viewerItem);

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...rooms.map((room, index) => {
        const area = Site.roomArea(room);
        return el("article", { className: "card card-interactive reveal", id: `room-${room.id}` },
            el("button", {
                className: "card-button",
                type: "button",
                "aria-label": `View ${room.name}`,
                onclick: () => Site.openLightbox(items, index)
            },
            el("div", { className: "card-media" },
                Site.image(room.image_url, room.name),
                room.floor ? el("span", { className: "tag", text: room.floor }) : null),
            el("div", { className: "card-body" },
                el("h3", { text: room.name }),
                el("p", { text: room.description || "No description available." }),
                el("dl", { className: "room-dims" },
                    el("div", {}, el("dt", { text: "Length" }), el("dd", { text: room.length ? `${Site.formatNumber(room.length, 2)} m` : "—" })),
                    el("div", {}, el("dt", { text: "Width" }), el("dd", { text: room.width ? `${Site.formatNumber(room.width, 2)} m` : "—" })),
                    el("div", {}, el("dt", { text: "Area" }), el("dd", { text: area ? `${Site.formatNumber(area, 1)} m²` : "—" }))))));
    }));

    Site.reveal(container);
}

// Links such as rooms.html#room-3 (from the homepage) open that room.
function openRoomFromHash() {
    const match = /^#room-(\d+)$/.exec(window.location.hash);
    if (!match) return;

    const rooms = filteredRooms();
    const index = rooms.findIndex(room => String(room.id) === match[1]);
    if (index < 0) return;

    document.getElementById(`room-${match[1]}`)?.scrollIntoView({ block: "center" });
    Site.openLightbox(rooms.map(viewerItem), index);
}
