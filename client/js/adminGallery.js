let galleryItems = [];

document.addEventListener("DOMContentLoaded", () => {

    setupAdminPage(() => {

        loadGallery();

        loadHouseOptions("house_id", ".field-note");

        document
            .getElementById("galleryForm")
            ?.addEventListener("submit", handleUpload);

        document
            .getElementById("searchGallery")
            ?.addEventListener("keyup", searchGallery);

        document
           .getElementById("addGalleryBtn")
           ?.addEventListener("click", showGalleryForm);

        document
           .getElementById("cancelGalleryBtn")
           ?.addEventListener("click", hideGalleryForm);

    });

});

async function loadGallery() {

    try {

        const response = await getGallery();

        if (!response.success) {

            showToast(
                response.message || "Unable to load gallery.",
                "error"
            );

            return;

        }

        galleryItems = response.data || [];

        renderGallery(galleryItems);

    }

    catch (error) {

        console.error(error);

        showToast(
            "Unable to load gallery.",
            "error"
        );

    }

}

function showGalleryForm() {

    document
        .getElementById("galleryFormCard")
        .classList
        .remove("hidden");

}

function hideGalleryForm() {

    document
        .getElementById("galleryFormCard")
        .classList
        .add("hidden");

    document
        .getElementById("galleryForm")
        .reset();

}

function renderGallery(items) {

    const container = document.getElementById("galleryTable");

    container.innerHTML = "";

    if (!items.length) {

        const empty = document.createElement("div");

        empty.className = "empty-state";

        empty.textContent = "No gallery images available.";

        container.appendChild(empty);

        return;

    }

    const table = document.createElement("table");

    const thead = document.createElement("thead");

    thead.innerHTML = `
        <tr>
            <th>ID</th>
            <th>Image</th>
            <th>Caption</th>
            <th>Uploaded</th>
            <th>Actions</th>
        </tr>
    `;

    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    items.forEach(item => {

        const tr = document.createElement("tr");

        // ID

        const idTd = document.createElement("td");

        idTd.textContent = item.id;

        // Image

        const imageTd = document.createElement("td");

        const img = document.createElement("img");

        img.src = normalizeImageUrl(item.image_url);

        img.alt = item.caption || "Gallery";

        img.className = "small-thumb";

        img.onerror = function () {

            this.src = "../images/no-image.jpg";

        };

        imageTd.appendChild(img);

        // Caption

        const captionTd = document.createElement("td");

        captionTd.textContent = item.caption || "—";

        // Date

        const dateTd = document.createElement("td");

        dateTd.textContent = item.uploaded_at
            ? new Date(item.uploaded_at).toLocaleDateString()
            : "Unknown";

        // Actions

        const actionTd = document.createElement("td");

        const deleteBtn = document.createElement("button");

        deleteBtn.className = "deleteBtn";

        deleteBtn.textContent = "Delete";

        deleteBtn.addEventListener("click", () => {

            deleteGalleryItem(item.id);

        });

        actionTd.appendChild(deleteBtn);

        tr.appendChild(idTd);
        tr.appendChild(imageTd);
        tr.appendChild(captionTd);
        tr.appendChild(dateTd);
        tr.appendChild(actionTd);

        tbody.appendChild(tr);

    });

    table.appendChild(tbody);

    container.appendChild(table);

}

async function handleUpload(event) {

    event.preventDefault();

    const imageInput = document.getElementById("image");

    const caption = document
        .getElementById("caption")
        .value
        .trim();

    const houseId = document
        .getElementById("house_id")
        .value;

    if (!imageInput.files.length) {

        showToast(
            "Please select an image.",
            "error"
        );

        return;

    }

    if (!houseId) {

        showToast(
            "Please select a house.",
            "error"
        );

        return;

    }

    const formData = new FormData();

    formData.append(
        "image",
        imageInput.files[0]
    );

    formData.append(
        "caption",
        caption
    );

    formData.append(
        "house_id",
        houseId
    );

    const response = await uploadGalleryImage(formData);

    if (!response.success) {

        showToast(
            response.message || "Upload failed.",
            "error"
        );

        return;

    }

    document
        .getElementById("galleryForm")
        .reset();

    hideGalleryForm();

    showToast("Image uploaded successfully.");

    loadGallery();

}

function searchGallery() {

    const query = document
        .getElementById("searchGallery")
        .value
        .toLowerCase();

    const filtered = galleryItems.filter(item =>

        (item.caption || "")
            .toLowerCase()
            .includes(query)

        ||

        String(item.id).includes(query)

    );

    renderGallery(filtered);

}

async function deleteGalleryItem(id) {

    const confirmed = await confirmAction(

        "Delete this gallery image? This action cannot be undone."

    );

    if (!confirmed) return;

    const response = await deleteGalleryImage(id);

    if (!response.success) {

        showToast(
            response.message || "Unable to delete image.",
            "error"
        );

        return;

    }

    showToast("Image deleted.");

    loadGallery();

}