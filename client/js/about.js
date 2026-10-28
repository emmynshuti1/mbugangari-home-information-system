// The House page: general information, description, location and map.
const { el } = Site;

Site.ready(() => {
    document.querySelectorAll("[data-icon]").forEach(node => { node.innerHTML = icon(node.dataset.icon); });
    loadHouseInformation();
});

function detailRows(container, rows) {
    container.replaceChildren(...rows
        .filter(([, value]) => value !== null && value !== undefined && value !== "")
        .map(([label, value]) => el("div", {}, el("dt", { text: label }), el("dd", { text: value }))));
}

async function loadHouseInformation() {
    const description = document.getElementById("houseDescription");
    const mapCard = document.getElementById("mapCard");

    let house;
    try {
        house = await Site.loadHouse();
    } catch (error) {
        Site.renderState(description, { type: "error", message: error.message, retry: loadHouseInformation });
        Site.renderState(mapCard, { type: "error", message: error.message });
        return;
    }

    if (!house) {
        Site.renderState(description, { title: "No house information yet", message: "Details about the home will appear here once they are added." });
        document.getElementById("locationSection").hidden = true;
        return;
    }

    document.title = `${house.name} | The House`;
    document.getElementById("houseName").textContent = house.name;
    description.replaceChildren(el("p", { text: house.description }));

    const age = house.year_built ? new Date().getFullYear() - Number(house.year_built) : null;
    detailRows(document.getElementById("houseDetails"), [
        ["Owner", house.owner],
        ["Year built", house.year_built ? `${house.year_built}${age > 0 ? ` (${age} year${age === 1 ? "" : "s"} ago)` : ""}` : null],
        ["Village", house.village],
        ["Sector", house.sector],
        ["District", house.district],
        ["Province", house.province],
        ["Country", house.country]
    ]);

    detailRows(document.getElementById("locationDetails"), [
        ["Village", house.village],
        ["Sector", house.sector],
        ["District", house.district],
        ["Province", house.province],
        ["Country", house.country],
        ["Latitude", house.latitude],
        ["Longitude", house.longitude]
    ]);

    Site.renderMap(mapCard, house);

    const cover = await Site.coverImage();
    const image = document.getElementById("aboutImage");
    if (cover) {
        image.src = normalizeImageUrl(cover.src);
        image.alt = cover.alt || house.name;
        image.hidden = false;
    }
}
