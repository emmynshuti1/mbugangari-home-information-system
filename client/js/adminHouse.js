// House information: details, location, coordinates and cover photo.
const { el } = Admin;

const HOUSE_FIELDS = [
    { name: "name", label: "House name", required: true, maxlength: 100 },
    { name: "owner", label: "Owner", required: true, maxlength: 100 },
    { name: "year_built", label: "Year built", type: "number", step: "1", integer: true, min: 1900, max: new Date().getFullYear(), inputmode: "numeric" },
    { name: "country", label: "Country", required: true, maxlength: 100, defaultValue: "Rwanda" },
    { name: "province", label: "Province", required: true, maxlength: 100 },
    { name: "district", label: "District", required: true, maxlength: 100 },
    { name: "sector", label: "Sector", required: true, maxlength: 100 },
    { name: "village", label: "Village", required: true, maxlength: 100 },
    { name: "latitude", label: "Latitude", type: "number", step: "any", min: -90, max: 90, inputmode: "decimal", hint: "Decimal degrees, e.g. -1.7025" },
    { name: "longitude", label: "Longitude", type: "number", step: "any", min: -180, max: 180, inputmode: "decimal", hint: "Decimal degrees, e.g. 29.2567" },
    { name: "description", label: "Description", type: "textarea", required: true, maxlength: 5000, rows: 7, hint: "Shown on the homepage and the House page." },
    { name: "image", label: "Cover photo", type: "image", hint: "Used as the large homepage image. Without one, the first gallery photo is used." }
];

let houses = [];
let current = null;
let initialSnapshot = "";

const { nodes, controls } = AdminForm.build(HOUSE_FIELDS);
const imageControl = controls.image;

Admin.init(() => {
    const form = document.getElementById("houseForm");
    form.prepend(...nodes);
    form.addEventListener("submit", saveHouse);

    document.getElementById("houseSelect").addEventListener("change", event => {
        selectHouse(houses.find(house => String(house.id) === event.target.value) || null);
    });
    document.getElementById("newHouseBtn").addEventListener("click", () => selectHouse(null));
    document.getElementById("deleteHouseBtn").addEventListener("click", removeHouse);
    document.getElementById("resetHouseBtn").addEventListener("click", () => selectHouse(current));

    window.addEventListener("beforeunload", event => {
        if (AdminForm.snapshot(controls) !== initialSnapshot) {
            event.preventDefault();
            event.returnValue = "";
        }
    });

    loadHouses();
});

async function loadHouses(selectId = null) {
    const status = document.getElementById("houseStatus");
    status.textContent = "Loading house information…";
    status.className = "form-message info";

    const response = await getHouse();

    if (!response.success) {
        status.textContent = response.message || "Unable to load house information.";
        status.className = "form-message error";
        return;
    }

    houses = response.data || [];
    status.textContent = "";
    status.className = "form-message";

    const select = document.getElementById("houseSelect");
    select.replaceChildren(...houses.map(house => el("option", { value: house.id, text: house.name })));
    document.getElementById("houseSelectWrap").hidden = houses.length < 2;

    const target = houses.find(house => String(house.id) === String(selectId)) || houses[0] || null;
    selectHouse(target);
}

function selectHouse(house) {
    current = house;
    AdminForm.fill(controls, house);
    imageControl.image.setProgress(null);
    initialSnapshot = AdminForm.snapshot(controls);

    document.getElementById("formTitle").textContent = house ? "House information" : "Create the house";
    document.getElementById("formSubtitle").textContent = house
        ? `Record #${house.id} · created ${Admin.timeAgo(house.created_at)}`
        : "No house record exists yet. Rooms, photos and other content all belong to a house.";
    document.getElementById("saveHouseBtn").innerHTML = house ? `${icon("check")} Save changes` : `${icon("plus")} Create house`;
    document.getElementById("dangerZone").hidden = !house;
    document.getElementById("newHouseBtn").hidden = !house;
    document.getElementById("houseFormAlert").hidden = true;

    if (house) document.getElementById("houseSelect").value = house.id;
}

async function saveHouse(event) {
    event.preventDefault();
    const alert = document.getElementById("houseFormAlert");
    alert.hidden = true;

    if (!AdminForm.validate(controls)) return;

    const payload = new FormData();
    Object.entries(AdminForm.read(controls)).forEach(([key, value]) => payload.append(key, value));
    const file = await imageControl.image.getFile();
    if (file) payload.append("image", file, file.name);

    const button = document.getElementById("saveHouseBtn");
    const options = { onProgress: fraction => imageControl.image.setProgress(fraction) };

    Admin.setBusy(button, true);
    const response = current
        ? await updateHouse(current.id, payload, options)
        : await createHouse(payload, options);
    Admin.setBusy(button, false);
    imageControl.image.setProgress(null);

    if (!response.success) {
        alert.replaceChildren(el("span", { html: icon("alert") }), el("div", { text: response.message || "Unable to save the house." }));
        alert.hidden = false;
        alert.scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
    }

    Admin.toast(current ? "House information updated." : "House created.");
    initialSnapshot = AdminForm.snapshot(controls);
    await loadHouses(response.data.id);
}

async function removeHouse() {
    if (!current) return;

    const ok = await Admin.confirm({
        title: "Delete this house?",
        message: "This permanently deletes the house and ALL of its rooms, photos, materials, history events and nearby places. This cannot be undone.",
        confirmText: "Delete everything",
        requireText: current.name
    });
    if (!ok) return;

    const response = await deleteHouse(current.id);

    if (!response.success) {
        Admin.toast(response.message || "Unable to delete the house.", "error");
        return;
    }

    Admin.toast(`${current.name} deleted.`);
    initialSnapshot = "";
    await loadHouses();
}
