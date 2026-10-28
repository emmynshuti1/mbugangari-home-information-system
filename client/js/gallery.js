// Gallery page: searchable photo grid with a full-screen viewer.
const { el } = Site;

let galleryImages = [];

Site.ready(() => {
    document.getElementById("searchGallery").addEventListener("input", displayGallery);
    loadGallery();
});

async function loadGallery() {
    const container = document.getElementById("galleryContainer");
    container.classList.add("gallery-grid");
    Site.renderSkeletons(container, 6, "photo");

    try {
        galleryImages = await Site.loadGallery();
        displayGallery();
    } catch (error) {
        container.classList.remove("gallery-grid");
        Site.renderState(container, { type: "error", title: "Unable to load the gallery", message: error.message, retry: loadGallery });
    }
}

function displayGallery() {
    const container = document.getElementById("galleryContainer");
    const query = document.getElementById("searchGallery").value.trim().toLowerCase();
    const images = galleryImages.filter(image => (image.caption || "").toLowerCase().includes(query));

    document.getElementById("galleryCount").textContent =
        `${images.length} photo${images.length === 1 ? "" : "s"}${query ? " found" : ""}`;

    if (!images.length) {
        container.classList.remove("gallery-grid");
        Site.renderState(container, galleryImages.length
            ? { title: "No matching photos", message: "Try a different search." }
            : { title: "No photos yet", message: "Photos will appear here once they are uploaded." });
        return;
    }

    container.classList.add("gallery-grid");
    container.setAttribute("aria-busy", "false");

    const items = images.map(image => ({
        src: image.image_url,
        title: image.caption || "Mbugangari Home",
        text: image.uploaded_at ? `Added ${Site.formatDate(image.uploaded_at.slice(0, 10))}` : ""
    }));

    container.replaceChildren(...images.map((image, index) =>
        el("button", {
            className: "photo reveal",
            type: "button",
            "aria-label": `View photo: ${image.caption || "Mbugangari Home"}`,
            onclick: () => Site.openLightbox(items, index)
        },
        Site.image(image.image_url, image.caption || "Mbugangari Home"),
        el("span", { className: "photo-caption" },
            image.caption || "",
            image.uploaded_at ? el("small", { text: Site.formatDate(image.uploaded_at.slice(0, 10), { short: true }) }) : null))));

    Site.reveal(container);
}
