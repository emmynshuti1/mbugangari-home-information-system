const pool = require("../config/db");
const { imageMetadataColumns } = require("../utils/images");

const ROOM_COLUMNS = `
    rooms.id,
    rooms.house_id,
    rooms.name,
    rooms.floor,
    rooms.length,
    rooms.width,
    rooms.description,
    rooms.image_url,
    ${imageMetadataColumns("rooms")}
`;

const ROOM_METADATA = `
    ${ROOM_COLUMNS},
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
        image_url = null,
        image_data = null,
        image_mime_type = null
    } = room;

    const result = await pool.query(
        `INSERT INTO rooms (house_id, name, floor, length, width, description, image_url, image_data, image_mime_type, image_updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CASE WHEN $8::bytea IS NULL THEN NULL ELSE CURRENT_TIMESTAMP END)
         RETURNING ${ROOM_COLUMNS}`,
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
                image_url = NULL,
                image_data = $7,
                image_mime_type = $8,
                image_updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING ${ROOM_COLUMNS}
            `,
            [house_id, name, floor, length, width, description, image_data, image_mime_type, id]
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
            RETURNING ${ROOM_COLUMNS}
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
        RETURNING id, name;
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
