const pool = require("../config/db");

// Check if nearby place exists
const exists = async (id) => {

    const result = await pool.query(
        `
        SELECT id
        FROM nearby_places
        WHERE id = $1;
        `,
        [id]
    );

    return result.rowCount > 0;
};

// Get all nearby places
const getAllPlaces = async () => {

    const result = await pool.query(`
        SELECT
            nearby_places.*,
            houses.name AS house_name
        FROM nearby_places
        INNER JOIN houses
            ON nearby_places.house_id = houses.id
        ORDER BY distance_meters ASC;
    `);

    return result.rows;
};

// Get place by ID
const getPlaceById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            nearby_places.*,
            houses.name AS house_name
        FROM nearby_places
        INNER JOIN houses
            ON nearby_places.house_id = houses.id
        WHERE nearby_places.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

// Create place
const createPlace = async ({
    house_id,
    name,
    category,
    distance_meters,
    description
}) => {

    const result = await pool.query(
        `
        INSERT INTO nearby_places
        (
            house_id,
            name,
            category,
            distance_meters,
            description
        )
        VALUES
        (
            $1,$2,$3,$4,$5
        )
        RETURNING *;
        `,
        [
            house_id,
            name,
            category,
            distance_meters,
            description
        ]
    );

    return result.rows[0];
};

// Update place
const updatePlace = async (
    id,
    {
        house_id,
        name,
        category,
        distance_meters,
        description
    }
) => {

    const result = await pool.query(
        `
        UPDATE nearby_places
        SET
            house_id = $1,
            name = $2,
            category = $3,
            distance_meters = $4,
            description = $5
        WHERE id = $6
        RETURNING *;
        `,
        [
            house_id,
            name,
            category,
            distance_meters,
            description,
            id
        ]
    );

    return result.rows[0];
};

// Delete place
const deletePlace = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM nearby_places
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    exists,
    getAllPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace
};