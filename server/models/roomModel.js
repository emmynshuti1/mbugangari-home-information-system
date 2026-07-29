const pool = require("../config/db");

// Check if room exists
const exists = async (id) => {

    const result = await pool.query(
        `
        SELECT id
        FROM rooms
        WHERE id = $1;
        `,
        [id]
    );

    return result.rowCount > 0;

};

// Get all rooms
const getAllRooms = async () => {

    const result = await pool.query(`
        SELECT
            rooms.*,
            houses.name AS house_name
        FROM rooms
        INNER JOIN houses
            ON rooms.house_id = houses.id
        ORDER BY rooms.id;
    `);

    return result.rows;

};

// Get room by ID
const getRoomById = async (id) => {

    const result = await pool.query(
        `
        SELECT
            rooms.*,
            houses.name AS house_name
        FROM rooms
        INNER JOIN houses
            ON rooms.house_id = houses.id
        WHERE rooms.id = $1;
        `,
        [id]
    );

    return result.rows[0];

};

// Create room
const createRoom = async (room) => {

    const {
        house_id,
        name,
        floor,
        length,
        width,
        description,
        image_url
    } = room;

    const result = await pool.query(
        `
        INSERT INTO rooms
        (
            house_id,
            name,
            floor,
            length,
            width,
            description,
            image_url
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7
        )
        RETURNING *;
        `,
        [
            house_id,
            name,
            floor,
            length,
            width,
            description,
            image_url
        ]
    );

    return result.rows[0];

};

// Update room
const updateRoom = async (id, room) => {

    const {
        house_id,
        name,
        floor,
        length,
        width,
        description,
        image_url
    } = room;

    const result = await pool.query(
        `
        UPDATE rooms
        SET
            house_id = $1,
            name = $2,
            floor = $3,
            length = $4,
            width = $5,
            description = $6,
            image_url = $7
        WHERE id = $8
        RETURNING *;
        `,
        [
            house_id,
            name,
            floor,
            length,
            width,
            description,
            image_url,
            id
        ]
    );

    return result.rows[0];

};

// Delete room
const deleteRoom = async (id) => {

    const result = await pool.query(
        `
        DELETE FROM rooms
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

};

module.exports = {
    exists,
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};