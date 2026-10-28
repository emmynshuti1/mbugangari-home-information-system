const pool = require("../config/db");
const { imageMetadataColumns } = require("../utils/images");

const GALLERY_METADATA = `
    gallery.id,
    gallery.house_id,
    gallery.image_url,
    gallery.caption,
    gallery.uploaded_at,
    ${imageMetadataColumns("gallery")}
`;

const getAllImages = async () => {
    const result = await pool.query(`
        SELECT ${GALLERY_METADATA}
        FROM gallery
        ORDER BY id ASC;
    `);

    return result.rows;
};

const getImageById = async (id) => {
    const result = await pool.query(
        `
        SELECT ${GALLERY_METADATA}
        FROM gallery
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const getImageFileById = async (id) => {
    const result = await pool.query(
        `
        SELECT image_data, image_mime_type
        FROM gallery
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const createImage = async ({
    house_id,
    image_url,
    caption,
    image_data = null,
    image_mime_type = null
}) => {
    const result = await pool.query(
        `INSERT INTO gallery (house_id, image_url, caption, image_data, image_mime_type, image_updated_at)
         VALUES ($1, $2, $3, $4, $5, CASE WHEN $4::bytea IS NULL THEN NULL ELSE CURRENT_TIMESTAMP END)
         RETURNING ${GALLERY_METADATA}`,
        [house_id, image_url, caption, image_data, image_mime_type]
    );
    return result.rows[0];
};

// Update caption/house and, when a new file is supplied, replace the image.
const updateImage = async (id, { house_id, caption }, file = null) => {
    const result = file
        ? await pool.query(
            `UPDATE gallery
             SET house_id = $1, caption = $2, image_url = '', image_data = $3,
                 image_mime_type = $4, image_updated_at = CURRENT_TIMESTAMP
             WHERE id = $5
             RETURNING ${GALLERY_METADATA}`,
            [house_id, caption, file.buffer, file.mimetype, id]
        )
        : await pool.query(
            `UPDATE gallery
             SET house_id = $1, caption = $2
             WHERE id = $3
             RETURNING ${GALLERY_METADATA}`,
            [house_id, caption, id]
        );

    return result.rows[0];
};

const deleteImage = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM gallery
        WHERE id = $1
        RETURNING id, caption;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllImages,
    getImageById,
    getImageFileById,
    createImage,
    updateImage,
    deleteImage
};
