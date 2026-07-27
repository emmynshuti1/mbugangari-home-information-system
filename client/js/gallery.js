let galleryImages = [];

document.addEventListener("DOMContentLoaded", () => {

    loadGallery();

    const modal = document.getElementById("imageModal");
    const closeBtn = document.querySelector(".close");

    closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
    });

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {
            modal.style.display = "none";
        }

    });

});

async function loadGallery() {

    const loading = document.getElementById("loading");

    try {

        const response = await getGallery();

        if (!response || !response.success) {

            loading.textContent = "Unable to load gallery.";

            return;

        }

        galleryImages = response.data;

        loading.style.display = "none";

        displayGallery(galleryImages);

    }

    catch (error) {

        console.error(error);

        loading.textContent = "Server connection failed.";

    }

}

function displayGallery(images) {

    const container = document.getElementById("galleryContainer");

    container.innerHTML = "";

    if (images.length === 0) {

        const message = document.createElement("h2");
        message.style.textAlign = "center";
        message.textContent = "No gallery images available.";

        container.appendChild(message);

        return;

    }

    images.forEach(image => {

        const imagePath = normalizeImageUrl(image.image_url);

        const uploadDate = image.uploaded_at
            ? new Date(image.uploaded_at).toLocaleDateString()
            : "Unknown";

        const card = document.createElement("div");
        card.className = "gallery-card";

        const img = document.createElement("img");

        img.src = imagePath;
        img.alt = image.caption || "Gallery Image";

        img.onerror = function () {
            this.src = "../images/no-image.jpg";
        };

        img.addEventListener("click", () => {
            openModal(imagePath, image.caption || "");
        });

        const body = document.createElement("div");
        body.className = "gallery-body";

        const title = document.createElement("h3");
        title.textContent = image.caption || "Home Image";

        const date = document.createElement("p");
        date.className = "gallery-date";
        date.textContent = `Uploaded: ${uploadDate}`;

        body.appendChild(title);
        body.appendChild(date);

        card.appendChild(img);
        card.appendChild(body);

        container.appendChild(card);

    });

}

function openModal(image, caption) {

    document.getElementById("modalImage").src = image;

    document.getElementById("modalCaption").textContent = caption;

    document.getElementById("imageModal").style.display = "flex";

}