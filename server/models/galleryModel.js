const pool = require("../config/db");

// Get all gallery images
const getAllImages = async () => {
    const result = await pool.query(`
        SELECT *
        FROM gallery
        ORDER BY uploaded_at DESC;
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
    caption
}) => {

    const result = await pool.query(
        `
        INSERT INTO gallery
        (
            house_id,
            image_url,
            caption
        )
        VALUES
        (
            $1,
            $2,
            $3
        )
        RETURNING *;
        `,
        [
            house_id,
            image_url,
            caption
        ]
    );

    return result.rows[0];
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