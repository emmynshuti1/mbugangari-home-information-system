let galleryItems = [];

document.addEventListener("DOMContentLoaded", () => {
    setupAdminPage(() => {
        loadGallery();
        loadHouseOptions("house_id", ".field-note");
        document.getElementById("galleryForm")?.addEventListener("submit", handleUpload);
        document.getElementById("searchGallery")?.addEventListener("keyup", searchGallery);
    });
});

async function loadGallery() {
    const response = await getGallery();
    if (!response.success) {
        alert(response.message || "Unable to load gallery.");
        return;
    }
    galleryItems = response.data;
    renderGallery(galleryItems);
}

function renderGallery(items) {
    const container = document.getElementById("galleryTable");
    container.innerHTML = "";
    if (!items.length) {
        container.innerHTML = `<div class="empty-state">No gallery images available.</div>`;
        return;
    }
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Caption</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${items.map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td><img src="${normalizeImageUrl(item.image_url)}" alt="${item.caption || "Gallery"}" class="small-thumb"></td>
                        <td>${item.caption || "—"}</td>
                        <td>${item.uploaded_at ? new Date(item.uploaded_at).toLocaleDateString() : "Unknown"}</td>
                        <td>
                            <button class="deleteBtn" onclick="deleteGalleryItem(${item.id})">Delete</button>
                        </td>
                    </tr>
                `).join("")}
            </tbody>
        </table>`;
}

async function handleUpload(event) {
    event.preventDefault();
    const imageInput = document.getElementById("image");
    const caption = document.getElementById("caption").value.trim();
    const houseIdValue = document.getElementById("house_id").value;
    const houseId = Number(houseIdValue);

    if (!imageInput.files.length) {
        alert("Select an image to upload.");
        return;
    }

    if (!houseIdValue || !houseId) {
        alert("Please select a valid house before uploading.");
        return;
    }

    const formData = new FormData();
    formData.append("image", imageInput.files[0]);
    formData.append("caption", caption);
    formData.append("house_id", houseId);

    const response = await uploadGalleryImage(formData);

    if (!response.success) {
        alert(response.message || "Upload failed.");
        return;
    }

    alert("Image uploaded successfully.");
    imageInput.value = "";
    document.getElementById("caption").value = "";
    loadGallery();
}

function searchGallery() {
    const query = document.getElementById("searchGallery").value.toLowerCase();
    const filtered = galleryItems.filter(item =>
        item.caption?.toLowerCase().includes(query) ||
        String(item.id).includes(query)
    );
    renderGallery(filtered);
}

async function deleteGalleryItem(id) {
    if (!confirm("Delete this gallery image?")) {
        return;
    }

    const response = await deleteGalleryImage(id);
    if (!response.success) {
        alert(response.message || "Unable to delete image.");
        return;
    }

    alert("Image deleted.");
    loadGallery();
}
