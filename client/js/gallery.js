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
    const container = document.getElementById("galleryContainer");

    try {

        const response = await getGallery();

        if (!response || !response.success) {

            loading.innerHTML = "Unable to load gallery.";

            return;

        }

        galleryImages = response.data;

        loading.style.display = "none";

        displayGallery(galleryImages);

    }

    catch (error) {

        console.error(error);

        loading.innerHTML = "Server connection failed.";

    }

}

function displayGallery(images) {

    const container = document.getElementById("galleryContainer");

    container.innerHTML = "";

    if (images.length === 0) {

        container.innerHTML = `
            <h2 style="text-align:center;">
                No gallery images available.
            </h2>
        `;

        return;

    }

    images.forEach(image => {

        const imagePath = normalizeImageUrl(image.image_url);

        const uploadDate = image.uploaded_at
            ? new Date(image.uploaded_at).toLocaleDateString()
            : "Unknown";

        container.innerHTML += `

        <div class="gallery-card">

            <img
                src="${imagePath}"
                alt="${image.caption || "Gallery Image"}"
                onclick="openModal('${imagePath}', '${image.caption || ""}')"
                onerror="this.src='../images/no-image.jpg'"
            >

            <div class="gallery-body">

                <h3>${image.caption || "Home Image"}</h3>

                <p class="gallery-date">

                    Uploaded:
                    ${uploadDate}

                </p>

            </div>

        </div>

        `;

    });

}

function openModal(image, caption) {

    document.getElementById("modalImage").src = image;

    document.getElementById("modalCaption").textContent = caption;

    document.getElementById("imageModal").style.display = "flex";

}