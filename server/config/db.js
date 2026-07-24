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

  try {
    const { rows } = await client.query(
      "SELECT COUNT(*) AS count FROM administrators;"
    );

    const count = parseInt(rows[0].count, 10);

    if (count === 0) {

      const defaultPassword = "Admin1234!";

      const passwordHash = bcrypt.hashSync(defaultPassword, 10);

      await client.query(
        `INSERT INTO administrators
        (full_name, email, password_hash)
        VALUES ($1,$2,$3)`,
        [
          "Administrator",
          "admin@mbugangari.com",
          passwordHash
        ]
      );

      console.log("✅ Default administrator created.");

    }

  } catch (error) {

    console.error(error.message);

  } finally {

    release();

  }

});

module.exports = pool;