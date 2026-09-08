const pool = require("../config/db");
const insertWithReusableId = require("../utils/reusableId");

// Get all gallery images
const getAllImages = async () => {
    const result = await pool.query(`
        SELECT
            id,
            house_id,
            image_url,
            caption,
            uploaded_at,
            image_data IS NOT NULL AS has_image
        FROM gallery
        ORDER BY id ASC;
    `);

    return result.rows;
};

// Get one gallery image
const getImageById = async (id) => {
    const result = await pool.query(
        `
        SELECT *
        FROM gallery
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

// Create gallery image
const createImage = async ({
    house_id,
    image_url,
    caption,
    image_data = null,
    image_mime_type = null
}) => {

    return insertWithReusableId({
        table: "gallery",
        columns: ["house_id", "image_url", "caption", "image_data", "image_mime_type"],
        values: [house_id, image_url, caption, image_data, image_mime_type]
    });
};

// Delete gallery image
const deleteImage = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM gallery
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllImages,
    getImageById,
    createImage,
    deleteImage
};
