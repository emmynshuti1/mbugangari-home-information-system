// Nearby places page: category filter, search, distances, and the home on a map.
const { el } = Site;

let allPlaces = [];
let activeCategory = "all";

Site.ready(() => {
    document.getElementById("searchPlace").addEventListener("input", displayPlaces);
    loadNearbyPlaces();
    loadMap();
});

async function loadMap() {
    const mapCard = document.getElementById("mapCard");
    try {
        Site.renderMap(mapCard, await Site.loadHouse());
    } catch (error) {
        Site.renderState(mapCard, { type: "error", message: error.message, retry: loadMap });
    }
}

async function loadNearbyPlaces() {
    const container = document.getElementById("placesContainer");
    Site.renderSkeletons(container, 4, "line");

    const response = await getNearbyPlaces();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", title: "Unable to load nearby places", message: response?.message, retry: loadNearbyPlaces });
        return;
    }

    allPlaces = (response.data || [])
        .slice()
        .sort((a, b) => (a.distance_meters ?? Infinity) - (b.distance_meters ?? Infinity));

    renderCategoryFilters();
    displayPlaces();
}

function renderCategoryFilters() {
    const group = document.getElementById("categoryFilters");
    const categories = [...new Set(allPlaces.map(place => place.category).filter(Boolean))].sort();

    if (categories.length < 2) {
        group.replaceChildren();
        return;
    }

    const chip = (value, label) => el("button", {
        className: "chip",
        type: "button",
        "aria-pressed": String(activeCategory === value),
        text: label,
        onclick: event => {
            activeCategory = value;
            group.querySelectorAll(".chip").forEach(button => button.setAttribute("aria-pressed", String(button === event.currentTarget)));
            displayPlaces();
        }
    });

    group.replaceChildren(chip("all", "All"), ...categories.map(category => chip(category, category)));
}

function displayPlaces() {
    const container = document.getElementById("placesContainer");
    const query = document.getElementById("searchPlace").value.trim().toLowerCase();

    const places = allPlaces.filter(place =>
        (activeCategory === "all" || place.category === activeCategory) &&
        `${place.name} ${place.category || ""} ${place.description || ""}`.toLowerCase().includes(query));

    document.getElementById("placeSummary").replaceChildren(
        el("span", {}, el("strong", { text: places.length }), ` place${places.length === 1 ? "" : "s"}`),
        places.length ? el("span", { text: "Sorted by distance from the home" }) : ""
    );

    if (!places.length) {
        Site.renderState(container, allPlaces.length
            ? { title: "No matching places", message: "Try a different search or category." }
            : { title: "No places yet", message: "Nearby places will appear here once they are added." });
        return;
    }

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...places.map(place => {
        const distance = Site.formatDistance(place.distance_meters);
        return el("article", { className: "card place reveal" },
            el("span", { className: "place-icon", html: icon(Site.categoryIcon(place.category)) }),
            el("div", {},
                el("h3", { text: place.name }),
                el("p", {}, place.category ? el("span", { className: "tag", text: place.category }) : null),
                place.description ? el("p", { text: place.description }) : null),
            distance ? el("div", { className: "place-distance" },
                el("strong", { text: distance }),
                el("span", { text: Site.walkingTime(place.distance_meters) || "" })) : null);
    }));

    Site.reveal(container);
}
