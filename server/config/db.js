const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test the database connection and ensure an admin exists
pool.connect(async (err, client, release) => {
  if (err) {
    console.error("❌ Database connection failed.");
    console.error(err.message);
    return;
  }

  console.log("✅ PostgreSQL connected successfully!");
});

module.exports = pool;