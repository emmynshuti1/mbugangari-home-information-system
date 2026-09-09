const pool = require("../config/db");

const ROOM_METADATA = `
    rooms.id,
    rooms.house_id,
    rooms.name,
    rooms.floor,
    rooms.length,
    rooms.width,
    rooms.description,
    rooms.image_url,
    rooms.image_data IS NOT NULL AS has_image,
    houses.name AS house_name
`;

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

const getAllRooms = async () => {
    const result = await pool.query(`
        SELECT
            ${ROOM_METADATA}
        FROM rooms
        INNER JOIN houses
            ON rooms.house_id = houses.id
        ORDER BY rooms.id;
    `);

    return result.rows;
};

const getRoomById = async (id) => {
    const result = await pool.query(
        `
        SELECT
            ${ROOM_METADATA}
        FROM rooms
        INNER JOIN houses
            ON rooms.house_id = houses.id
        WHERE rooms.id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

const getRoomImageById = async (id) => {
    const result = await pool.query(
        `
        SELECT image_data, image_mime_type
        FROM rooms
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];
};

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

    const result = await pool.query(
        `INSERT INTO rooms (house_id, name, floor, length, width, description, image_url, image_data, image_mime_type)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING
            id,
            house_id,
            name,
            floor,
            length,
            width,
            description,
            image_url,
            image_data IS NOT NULL AS has_image`,
        [house_id, name, floor, length, width, description, image_url, image_data, image_mime_type]
    );
    return result.rows[0];
};

const updateRoom = async (id, room, replaceImage = false) => {
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

    const result = replaceImage
        ? await pool.query(
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
            RETURNING
                id,
                house_id,
                name,
                floor,
                length,
                width,
                description,
                image_url,
                image_data IS NOT NULL AS has_image
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
        )
        : await pool.query(
            `
            UPDATE rooms
            SET
                house_id = $1,
                name = $2,
                floor = $3,
                length = $4,
                width = $5,
                description = $6
            WHERE id = $7
            RETURNING
                id,
                house_id,
                name,
                floor,
                length,
                width,
                description,
                image_url,
                image_data IS NOT NULL AS has_image
            `,
            [house_id, name, floor, length, width, description, id]
        );

    return result.rows[0];
};

const deleteRoom = async (id) => {
    const result = await pool.query(
        `
        DELETE FROM rooms
        WHERE id = $1
        RETURNING id;
        `,
        [id]
    );

    return result.rows[0];
};

module.exports = {
    exists,
    getAllRooms,
    getRoomById,
    getRoomImageById,
    createRoom,
    updateRoom,
    deleteRoom
};
