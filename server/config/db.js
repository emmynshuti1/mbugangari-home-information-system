require("./loadEnv");

const { Pool, types } = require("pg");

// Return DATE columns as plain "YYYY-MM-DD" strings. The default parser turns
// them into local-midnight Date objects, which shifts the day when the server
// is not running in UTC.
types.setTypeParser(1082, value => value);

const connectionString = process.env.DATABASE_URL || "";
const isLocalDatabase = /localhost|127\.0\.0\.1/i.test(connectionString);

const pool = new Pool({
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    max: Number(process.env.DB_POOL_MAX) || 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000
});

// Neon closes idle connections; without this listener the process would crash.
pool.on("error", error => {
    console.error("Unexpected database client error:", error.message);
});

pool.connect((err, client, release) => {
    if (err) {
        console.error("Database connection failed.");
        console.error(err.message);
        return;
    }

    console.log("PostgreSQL connected successfully.");
    release();
});

module.exports = pool;
