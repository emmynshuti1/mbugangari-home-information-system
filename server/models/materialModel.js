const pool = require("../config/db");

// Check if material exists
const exists = async (id) => {
    const result = await pool.query(
        `
        SELECT id
        FROM materials
        WHERE id = $1;
        `,
        [id]
    );

    return result.rowCount > 0;
};

// Get all materials
const getAllMaterials = async () => {
    const result = await pool.query(`
        SELECT
            materials.*,
            houses.name AS house_name
        FROM materials
        INNER JOIN houses
            ON materials.house_id = houses.id
        ORDER BY materials.id;
    `);

    return result.rows;
};

// Get material by ID
const getMaterialById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            materials.*,
            houses.name AS house_name
        FROM materials
        INNER JOIN houses
            ON materials.house_id = houses.id
        WHERE materials.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

// Create material
const createMaterial = async ({
    house_id,
    component,
    material_name,
    description
}) => {

    const result = await pool.query(
        `
        INSERT INTO materials
        (
            house_id,
            component,
            material_name,
            description
        )
        VALUES
        (
            $1,$2,$3,$4
        )
        RETURNING *;
        `,
        [
            house_id,
            component,
            material_name,
            description
        ]
    );

    return result.rows[0];
};

// Update material
const updateMaterial = async (
    id,
    {
        house_id,
        component,
        material_name,
        description
    }
) => {

    const result = await pool.query(
        `
        UPDATE materials
        SET
            house_id = $1,
            component = $2,
            material_name = $3,
            description = $4
        WHERE id = $5
        RETURNING *;
        `,
        [
            house_id,
            component,
            material_name,
            description,
            id
        ]
    );

    return result.rows[0];
};

// Delete material
const deleteMaterial = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM materials
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    exists,
    getAllMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};