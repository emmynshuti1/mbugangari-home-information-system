// Helpers shared by every resource that stores an image in PostgreSQL.
const { detectImageMime } = require("../middleware/validateImageFile");

// Some legacy images were stored with a type guessed from their file name;
// serve the type that matches the actual bytes.
const actualMimeType = data => {
    if (data && data.length >= 12 && data.subarray(4, 12).toString("ascii") === "ftypavif") return "image/avif";
    return detectImageMime(data);
};

// SQL fragment that exposes image metadata without loading the bytes.
const imageMetadataColumns = table => `
    ${table}.image_data IS NOT NULL AS has_image,
    FLOOR(EXTRACT(EPOCH FROM ${table}.image_updated_at))::bigint AS image_version
`;

// Replace the stored-bytes columns with a public URL. The version query string
// changes whenever the image is replaced, so browsers can cache it safely.
const withImageUrl = (row, basePath) => {
    if (!row) return row;

    const { image_data, image_mime_type, has_image, image_version, ...data } = row;

    if (has_image || image_data) {
        data.image_url = `${basePath}/${data.id}/image${image_version ? `?v=${image_version}` : ""}`;
    }

    return data;
};

const sendImage = (req, res, image) => {
    res.type(actualMimeType(image.image_data) || image.image_mime_type || "image/jpeg");
    res.set(
        "Cache-Control",
        req.query.v ? "public, max-age=31536000, immutable" : "public, max-age=3600"
    );
    res.send(image.image_data);
};

module.exports = { imageMetadataColumns, withImageUrl, sendImage };
