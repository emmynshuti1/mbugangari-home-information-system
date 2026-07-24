// models/historyModel.js

const pool = require("../config/db");

// Get all history records
const getAllHistory = async () => {
    const result = await pool.query(`
        SELECT
            history.*,
            houses.name AS house_name
        FROM history
        INNER JOIN houses
            ON history.house_id = houses.id
        ORDER BY event_date DESC;
    `);

    return result.rows;
};

// Get history by ID
const getHistoryById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            history.*,
            houses.name AS house_name
        FROM history
        INNER JOIN houses
            ON history.house_id = houses.id
        WHERE history.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

// Create history record
const createHistory = async ({
    house_id,
    title,
    description,
    event_date
}) => {

    const result = await pool.query(
        `
        INSERT INTO history
        (
            house_id,
            title,
            description,
            event_date
        )
        VALUES
        (
            $1,$2,$3,$4
        )
        RETURNING *;
        `,
        [
            house_id,
            title,
            description,
            event_date
        ]
    );

    return result.rows[0];
};

// Update history record
const updateHistory = async (
    id,
    {
        house_id,
        title,
        description,
        event_date
    }
) => {

    const result = await pool.query(
        `
        UPDATE history
        SET
            house_id = $1,
            title = $2,
            description = $3,
            event_date = $4
        WHERE id = $5
        RETURNING *;
        `,
        [
            house_id,
            title,
            description,
            event_date,
            id
        ]
    );

    return result.rows[0];
};

// Delete history record
const deleteHistory = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM history
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    getAllHistory,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory
};