const pool = require("../config/db");

const GALLERY_METADATA = `
    id,
    house_id,
    image_url,
    caption,
    uploaded_at,
    image_data IS NOT NULL AS has_image
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
        `INSERT INTO gallery (house_id, image_url, caption, image_data, image_mime_type)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING ${GALLERY_METADATA}`,
        [house_id, image_url, caption, image_data, image_mime_type]
    );
    return result.rows[0];
};

const deleteImage = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM gallery
        WHERE id = $1
        RETURNING id;
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
    deleteImage
};
