const fs = require("fs/promises");
const path = require("path");
const pool = require("./db");

const mimeByExtension = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp"
};

async function ensureImageStorage() {
    await pool.query(`
        ALTER TABLE rooms
            ADD COLUMN IF NOT EXISTS image_data BYTEA,
            ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR(100);
        ALTER TABLE gallery
            ADD COLUMN IF NOT EXISTS image_data BYTEA,
            ADD COLUMN IF NOT EXISTS image_mime_type VARCHAR(100);
    `);
}

async function migrateLegacyImages() {
    const legacyImagesDirectory = path.join(__dirname, "../../client/images");
    const collections = [
        { table: "gallery", predicate: "image_url LIKE 'images/%'" },
        { table: "rooms", predicate: "image_url NOT LIKE '/uploads/%'" }
    ];

    for (const collection of collections) {
        const { rows } = await pool.query(`
            SELECT id, image_url FROM ${collection.table}
            WHERE image_data IS NULL AND image_url IS NOT NULL AND ${collection.predicate}
        `);

        for (const image of rows) {
            const filename = path.basename(image.image_url);
            const extension = path.extname(filename).toLowerCase();
            const mimeType = mimeByExtension[extension];
            if (!mimeType) continue;

            try {
                const data = await fs.readFile(path.join(legacyImagesDirectory, filename));
                await pool.query(
                    `UPDATE ${collection.table}
                     SET image_data = $1, image_mime_type = $2
                     WHERE id = $3`,
                    [data, mimeType, image.id]
                );
            } catch (error) {
                if (error.code !== "ENOENT") throw error;
            }
        }
    }
}

module.exports = { ensureImageStorage, migrateLegacyImages };
