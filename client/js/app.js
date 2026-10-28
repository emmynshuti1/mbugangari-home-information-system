// Homepage: every section is filled from the API.
const { el } = Site;

Site.ready(() => {
    Site.renderSkeletons(document.getElementById("featuredRooms"), 3);
    Site.renderSkeletons(document.getElementById("galleryPreview"), 5, "photo");
    Site.renderSkeletons(document.getElementById("latestHistory"), 3, "line");
    Site.renderSkeletons(document.getElementById("nearbyPreview"), 3, "line");

    loadHero();
    loadAbout();
    loadRoomsAndFacts();
    loadGalleryPreview();
    loadLatestHistory();
    loadNearbyPreview();
});

async function loadHero() {
    const heroImage = document.getElementById("heroImage");
    const cover = await Site.coverImage();

    heroImage.addEventListener("error", () => {
        heroImage.src = CONFIG.SITE_ROOT + "images/hero.jpg";
    }, { once: true });
    heroImage.src = cover ? normalizeImageUrl(cover.src) : CONFIG.SITE_ROOT + "images/hero.jpg";
    heroImage.alt = cover?.alt || "The Mbugangari Home";
    heroImage.hidden = false;
}

async function loadAbout() {
    const description = document.getElementById("homeDescription");
    const details = document.getElementById("homeDetails");

    try {
        const house = await Site.loadHouse();

        if (!house) {
            description.replaceChildren(el("p", { text: "House information has not been added yet." }));
            return;
        }

        description.replaceChildren(el("p", { text: house.description }));

        const rows = [
            ["Owner", house.owner],
            ["Year built", house.year_built],
            ["District", house.district],
            ["Province", house.province]
        ].filter(([, value]) => value);

        details.replaceChildren(...rows.map(([label, value]) =>
            el("div", {}, el("dt", { text: label }), el("dd", { text: value }))));

        if (house.year_built) {
            const age = new Date().getFullYear() - Number(house.year_built);
            document.getElementById("factYear").textContent = house.year_built;
            if (age > 0) {
                document.getElementById("aboutBadgeValue").textContent = `${age} year${age === 1 ? "" : "s"}`;
                document.getElementById("aboutBadgeLabel").textContent = `since it was built in ${house.year_built}`;
                document.getElementById("aboutBadge").hidden = false;
            }
        }
    } catch (error) {
        description.replaceChildren(el("p", { text: error.message }));
    }

    // Use a different photo from the hero for this section when possible.
    const gallery = await Site.loadGallery().catch(() => []);
    const aboutImage = document.getElementById("aboutImage");
    const photo = gallery[1] || gallery[0];
    if (photo) {
        aboutImage.src = normalizeImageUrl(photo.image_url);
        aboutImage.alt = photo.caption || "The home";
        aboutImage.hidden = false;
    }
}

function roomCard(room) {
    const area = Site.roomArea(room);
    return el("a", { className: "card card-link reveal", href: `pages/rooms.html#room-${room.id}` },
        el("div", { className: "card-media" },
            Site.image(room.image_url, room.name),
            room.floor ? el("span", { className: "tag", text: room.floor }) : null),
        el("div", { className: "card-body" },
            el("h3", { text: room.name }),
            room.description ? el("p", { text: room.description }) : null,
            area ? el("div", { className: "card-meta" },
                el("span", { html: `${icon("maximize")} ${Site.formatNumber(area, 1)} m²` }),
                el("span", { html: `${icon("ruler")} ${Site.formatNumber(room.length, 2)} × ${Site.formatNumber(room.width, 2)} m` })) : null));
}

async function loadRoomsAndFacts() {
    const container = document.getElementById("featuredRooms");
    const response = await getRooms();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", message: response?.message, retry: loadRoomsAndFacts });
        return;
    }

    const rooms = response.data || [];
    const totalArea = rooms.reduce((sum, room) => sum + (Site.roomArea(room) || 0), 0);

    document.getElementById("factRooms").textContent = rooms.length;
    document.getElementById("factArea").textContent = totalArea ? `${Site.formatNumber(totalArea)} m²` : "—";

    if (!rooms.length) {
        Site.renderState(container, { title: "No rooms yet", message: "Rooms will appear here once they are added." });
        return;
    }

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...rooms.slice(0, 3).map(roomCard));
    Site.reveal(container);
}

async function loadGalleryPreview() {
    const container = document.getElementById("galleryPreview");

    try {
        const images = await Site.loadGallery();

        if (!images.length) {
            container.style.display = "block";
            Site.renderState(container, { title: "No photos yet", message: "Photos will appear here once they are uploaded." });
            return;
        }

        const items = images.map(image => ({ src: image.image_url, title: image.caption || "Mbugangari Home" }));
        const preview = images.slice(0, 5).map((image, index) =>
            el("button", {
                className: "photo reveal",
                type: "button",
                "aria-label": `View photo: ${image.caption || "Mbugangari Home"}`,
                onclick: () => Site.openLightbox(items, index)
            },
            Site.image(image.image_url, image.caption || "Mbugangari Home"),
            el("span", { className: "photo-caption", text: image.caption || "" })));

        container.setAttribute("aria-busy", "false");
        container.replaceChildren(...preview);
        Site.reveal(container);
    } catch (error) {
        container.style.display = "block";
        Site.renderState(container, { type: "error", message: error.message, retry: () => { container.style.display = ""; loadGalleryPreview(); } });
    }
}

async function loadLatestHistory() {
    const container = document.getElementById("latestHistory");
    const response = await getHistory();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", message: response?.message, retry: loadLatestHistory });
        return;
    }

    // The API returns newest first; show the three most recent events.
    const events = (response.data || []).slice(0, 3);

    if (!events.length) {
        Site.renderState(container, { title: "No history yet", message: "Historical events will appear here once they are added." });
        return;
    }

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...events.map(event => {
        const parts = Site.dateParts(event.event_date);
        return el("article", { className: "timeline-item" },
            el("div", { className: "timeline-year" },
                el("strong", { text: parts ? parts.year : "—" }),
                el("span", { text: parts ? Site.formatDate(event.event_date, { short: true }).replace(/ \d{4}$/, "") : "" })),
            el("div", { className: "card timeline-card" },
                el("h3", { text: event.title }),
                event.description ? el("p", { text: event.description }) : null));
    }));
}

function placeRow(place) {
    const distance = Site.formatDistance(place.distance_meters);
    return el("article", { className: "card place" },
        el("span", { className: "place-icon", html: icon(Site.categoryIcon(place.category)) }),
        el("div", {},
            el("h3", { text: place.name }),
            el("p", { text: place.category || "Landmark" })),
        distance ? el("div", { className: "place-distance" },
            el("strong", { text: distance }),
            el("span", { text: Site.walkingTime(place.distance_meters) || "" })) : null);
}

async function loadNearbyPreview() {
    const container = document.getElementById("nearbyPreview");
    const response = await getNearbyPlaces();

    if (!response || !response.success) {
        Site.renderState(container, { type: "error", message: response?.message, retry: loadNearbyPreview });
        return;
    }

    const places = (response.data || [])
        .slice()
        .sort((a, b) => (a.distance_meters ?? Infinity) - (b.distance_meters ?? Infinity));

    const nearest = places.find(place => place.distance_meters !== null && place.distance_meters !== undefined);
    if (nearest) {
        document.getElementById("factNearest").textContent = Site.formatDistance(nearest.distance_meters);
        document.getElementById("factNearestLabel").textContent = `To ${nearest.name}`;
    }

    if (!places.length) {
        Site.renderState(container, { title: "No places yet", message: "Nearby places will appear here once they are added." });
        return;
    }

    container.setAttribute("aria-busy", "false");
    container.replaceChildren(...places.slice(0, 4).map(placeRow));
}
