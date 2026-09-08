const pool = require("../config/db");
const insertWithReusableId = require("../utils/reusableId");

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
        image_url,
        image_data = null,
        image_mime_type = null
    } = room;

    return insertWithReusableId({
        table: "rooms",
        columns: ["house_id", "name", "floor", "length", "width", "description", "image_url", "image_data", "image_mime_type"],
        values: [house_id, name, floor, length, width, description, image_url, image_data, image_mime_type]
    });

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
        image_url,
        image_data = null,
        image_mime_type = null
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
            image_url = $7,
            image_data = $8,
            image_mime_type = $9
        WHERE id = $10
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
            image_data,
            image_mime_type,
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
