const pool = require("../config/db");

/**
 * Inserts a record using the lowest currently unused positive ID.
 * The advisory lock makes the allocation safe when two admin requests arrive together.
 */
async function insertWithReusableId({ table, columns, values }) {
    if (!/^[a-z_]+$/.test(table) || columns.some(column => !/^[a-z_]+$/.test(column))) {
        throw new Error("Invalid reusable ID configuration.");
    }

    const client = await pool.connect();

    try {
        await client.query("BEGIN");
        await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [table]);

        const nextId = await client.query(`
            SELECT series.id
            FROM generate_series(1, COALESCE((SELECT MAX(id) FROM ${table}), 0) + 1) AS series(id)
            WHERE NOT EXISTS (SELECT 1 FROM ${table} WHERE ${table}.id = series.id)
            ORDER BY series.id
            LIMIT 1
        `);

        const id = nextId.rows[0].id;
        const placeholders = values.map((_, index) => `$${index + 2}`).join(", ");
        const result = await client.query(
            `INSERT INTO ${table} (id, ${columns.join(", ")})
             VALUES ($1, ${placeholders})
             RETURNING *`,
            [id, ...values]
        );

        await client.query(
            `SELECT setval(pg_get_serial_sequence($1, 'id')::regclass, (SELECT MAX(id) FROM ${table}), true)`,
            [table]
        );
        await client.query("COMMIT");
        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

module.exports = insertWithReusableId;
