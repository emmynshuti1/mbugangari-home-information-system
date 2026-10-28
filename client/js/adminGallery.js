// Gallery management: upload, caption, replace and delete photos.
Admin.init(() => {
    AdminResource({
        key: "gallery",
        singular: "photo",
        plural: "photos",
        icon: "image",
        view: "grid",
        publicUrl: "../pages/gallery.html",
        multipart: true,
        addLabel: "Upload photo",
        createLabel: "Upload photo",
        searchPlaceholder: "Search by caption…",
        api: { list: getGallery, create: uploadGalleryImage, update: updateGalleryImage, remove: deleteGalleryImage },
        defaultSort: { key: "id", dir: "asc" },
        searchText: item => `${item.caption || ""} ${item.id}`,
        fields: [
            { name: "house_id", label: "House", type: "house", required: true },
            { name: "caption", label: "Caption", maxlength: 255, full: true, placeholder: "e.g. Front view of the house", hint: "Shown on the website and read aloud by screen readers." },
            { name: "image", label: "Photo", type: "image", requiredOnCreate: true, hint: "When editing, choose Replace to swap the photo while keeping its caption." }
        ],
        columns: [{ label: "ID", key: "id", sortValue: item => Number(item.id) }],
        cardBody: item => [
            Admin.el("strong", { text: item.caption || "Untitled photo" }),
            Admin.el("small", { text: item.uploaded_at ? `Uploaded ${Admin.timeAgo(item.uploaded_at)}` : "" })
        ],
        titleOf: item => item.caption || `Photo #${item.id}`
    });
});
