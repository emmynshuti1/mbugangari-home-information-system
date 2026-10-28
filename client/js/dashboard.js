// Dashboard: live statistics, content health checks, recent admin activity,
// and the latest gallery uploads — all computed from the API.
const { el } = Admin;

Admin.init(admin => {
    if (admin?.full_name) {
        document.getElementById("welcomeTitle").textContent = `Welcome back, ${admin.full_name.split(" ")[0]}`;
    }
    loadDashboard();
    loadActivity();
});

const ENTITY = {
    house: { label: "House", icon: "home", page: "houses.html" },
    room: { label: "Room", icon: "door", page: "rooms.html" },
    gallery: { label: "Photo", icon: "image", page: "gallery.html" },
    material: { label: "Material", icon: "brick", page: "materials.html" },
    history: { label: "History event", icon: "clock", page: "history.html" },
    place: { label: "Nearby place", icon: "pin", page: "places.html" }
};

const ACTION_VERB = { create: "added", update: "updated", delete: "deleted" };

function roomArea(room) {
    return Number(room.length) > 0 && Number(room.width) > 0 ? Number(room.length) * Number(room.width) : 0;
}

function statCard({ label, value, note, iconName, href }) {
    return el("a", { className: "panel stat", href },
        el("div", { className: "stat-top" },
            el("span", { className: "stat-icon", html: icon(iconName) }),
            el("span", { className: "stat-note", html: icon("arrowRight") })),
        el("span", { className: "stat-value", text: value }),
        el("span", { className: "stat-label", text: label }),
        note ? el("span", { className: "stat-note", text: note }) : null);
}

async function loadDashboard() {
    const stats = document.getElementById("stats");
    stats.replaceChildren(...Array.from({ length: 5 }, () => el("div", { className: "panel stat" },
        el("div", { className: "skeleton", style: "width:42px;height:42px;border-radius:12px" }),
        el("div", { className: "skeleton", style: "width:50%;height:28px" }),
        el("div", { className: "skeleton", style: "width:70%" }))));

    const [houses, rooms, gallery, materials, history, places] = await Promise.all([
        getHouse(), getRooms(), getGallery(), getMaterials(), getHistory(), getNearbyPlaces()
    ]);

    const failed = [houses, rooms, gallery, materials, history, places].find(response => !response?.success);
    if (failed) {
        stats.replaceChildren(el("div", { className: "panel empty error", style: "grid-column:1/-1" },
            el("span", { html: icon("alert") }),
            el("strong", { text: "Unable to load statistics" }),
            el("p", { text: failed?.message || "Please try again." }),
            el("button", { className: "btn btn-secondary btn-sm", type: "button", html: `${icon("refresh")} Try again`, onclick: loadDashboard })));
        return;
    }

    const data = {
        house: houses.data[0] || null,
        rooms: rooms.data || [],
        gallery: gallery.data || [],
        materials: materials.data || [],
        history: history.data || [],
        places: places.data || []
    };

    if (data.house) {
        document.getElementById("welcomeText").textContent =
            `Manage the content of ${data.house.name}. Changes appear on the public website as soon as they are saved.`;
    }

    const totalArea = data.rooms.reduce((sum, room) => sum + roomArea(room), 0);
    const components = new Set(data.materials.map(item => item.component)).size;
    const categories = new Set(data.places.map(item => item.category).filter(Boolean)).size;
    const latestEvent = data.history.find(event => event.event_date);

    stats.replaceChildren(
        statCard({ label: "Rooms", value: data.rooms.length, note: totalArea ? `${Math.round(totalArea)} m² documented` : null, iconName: "door", href: "rooms.html" }),
        statCard({ label: "Gallery photos", value: data.gallery.length, note: data.gallery.length ? `Last added ${Admin.timeAgo(latestUpload(data.gallery)?.uploaded_at)}` : null, iconName: "image", href: "gallery.html" }),
        statCard({ label: "Materials", value: data.materials.length, note: components ? `${components} component${components === 1 ? "" : "s"}` : null, iconName: "brick", href: "materials.html" }),
        statCard({ label: "History events", value: data.history.length, note: latestEvent ? `Latest: ${Admin.formatDate(latestEvent.event_date)}` : null, iconName: "clock", href: "history.html" }),
        statCard({ label: "Nearby places", value: data.places.length, note: categories ? `${categories} categor${categories === 1 ? "y" : "ies"}` : null, iconName: "pin", href: "places.html" })
    );

    document.querySelectorAll("[data-count]").forEach(node => {
        const value = data[node.dataset.count];
        if (Array.isArray(value)) node.textContent = value.length;
    });

    renderChecks(data);
    renderLatestPhotos(data.gallery);
}

function latestUpload(gallery) {
    return gallery.slice().sort((a, b) => String(b.uploaded_at).localeCompare(String(a.uploaded_at)))[0];
}

function renderChecks(data) {
    const { house, rooms, gallery, history, places } = data;
    const count = (items, test) => items.filter(test).length;

    const checks = house
        ? [
            { ok: Boolean(house.image_url), text: "House cover photo", detail: house.image_url ? "Shown on the homepage" : "The homepage is using the first gallery photo", href: "houses.html" },
            { ok: house.latitude !== null && house.longitude !== null, text: "Map coordinates", detail: house.latitude !== null ? "Map is shown on the website" : "Add latitude and longitude to show the map", href: "houses.html" },
            { ok: rooms.length > 0, text: "Rooms added", detail: rooms.length ? `${rooms.length} room${rooms.length === 1 ? "" : "s"}` : "No rooms yet", href: "rooms.html" },
            { ok: !count(rooms, room => !room.image_url), text: "Every room has a photo", detail: `${count(rooms, room => !room.image_url)} without a photo`, href: "rooms.html" },
            { ok: !count(rooms, room => !roomArea(room)), text: "Every room has dimensions", detail: `${count(rooms, room => !roomArea(room))} missing length or width`, href: "rooms.html" },
            { ok: !count(gallery, item => !item.caption), text: "Every photo has a caption", detail: `${count(gallery, item => !item.caption)} without a caption`, href: "gallery.html" },
            { ok: !count(history, item => !item.event_date), text: "Every event has a date", detail: `${count(history, item => !item.event_date)} without a date`, href: "history.html" },
            { ok: !count(places, item => item.distance_meters === null), text: "Every place has a distance", detail: `${count(places, item => item.distance_meters === null)} without a distance`, href: "places.html" }
        ]
        : [{ ok: false, text: "House information", detail: "Create the house record first — all other content belongs to it.", href: "houses.html" }];

    const done = checks.filter(check => check.ok).length;
    document.getElementById("checksSummary").textContent = `${done} of ${checks.length} complete`;

    document.getElementById("checks").replaceChildren(...checks.map(check =>
        el("a", { className: "list-item", href: check.href },
            el("span", { className: `dot-icon ${check.ok ? "ok" : "warn"}`, html: icon(check.ok ? "check" : "alert") }),
            el("div", {},
                el("strong", { text: check.text }),
                el("small", { text: check.ok && /^0 /.test(check.detail) ? "All set" : check.detail })))));
}

function renderLatestPhotos(gallery) {
    const container = document.getElementById("latestPhotos");
    const photos = gallery.slice().sort((a, b) => String(b.uploaded_at).localeCompare(String(a.uploaded_at))).slice(0, 4);

    if (!photos.length) {
        container.replaceChildren(el("div", { className: "empty", style: "grid-column:1/-1" },
            el("span", { html: icon("image") }),
            el("strong", { text: "No photos yet" }),
            el("a", { className: "btn btn-sm", href: "gallery.html?new=1", html: `${icon("upload")} Upload a photo` })));
        return;
    }

    container.replaceChildren(...photos.map(photo =>
        el("a", { href: `gallery.html?edit=${photo.id}`, title: photo.caption || `Photo #${photo.id}` },
            Admin.thumb(photo.image_url, photo.caption || `Photo #${photo.id}`, ""))));
}

async function loadActivity() {
    const container = document.getElementById("activity");
    container.replaceChildren(...Array.from({ length: 4 }, () => el("div", { className: "list-item" },
        el("div", { className: "skeleton", style: "width:34px;height:34px;flex:none" }),
        el("div", {}, el("div", { className: "skeleton", style: "width:60%" })))));

    const response = await getActivity(12);

    if (!response.success) {
        container.replaceChildren(el("div", { className: "empty error" },
            el("span", { html: icon("alert") }),
            el("strong", { text: "Unable to load recent activity" }),
            el("p", { text: response.message }),
            el("button", { className: "btn btn-secondary btn-sm", type: "button", html: `${icon("refresh")} Try again`, onclick: loadActivity })));
        return;
    }

    if (!response.data.length) {
        container.replaceChildren(el("div", { className: "empty" },
            el("span", { html: icon("activity") }),
            el("strong", { text: "No activity yet" }),
            el("p", { text: "Changes you and other administrators make will be listed here." })));
        return;
    }

    container.replaceChildren(...response.data.map(entry => {
        const entity = ENTITY[entry.entity] || { label: entry.entity, icon: "grid", page: "dashboard.html" };
        return el("div", { className: "list-item" },
            el("span", { className: `dot-icon ${entry.action}`, html: icon(entry.action === "delete" ? "trash" : entry.action === "create" ? "plus" : entity.icon) }),
            el("div", {},
                el("strong", { text: `${entity.label} ${ACTION_VERB[entry.action] || entry.action}: ${entry.label || `#${entry.entity_id}`}` }),
                el("small", { title: new Date(entry.created_at).toLocaleString(), text: `${Admin.timeAgo(entry.created_at)}${entry.admin_email ? ` · ${entry.admin_email}` : ""}` })));
    }));
}
