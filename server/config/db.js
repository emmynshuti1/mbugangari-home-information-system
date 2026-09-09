require("./loadEnv");

const { Pool } = require("pg");

const connectionString = process.env.DATABASE_URL || "";
const isLocalDatabase = /localhost|127\.0\.0\.1/i.test(connectionString);

const pool = new Pool({
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false }
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
