const { Pool } = require("pg");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
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
    const { rows } = await client.query("SELECT COUNT(*) AS count FROM administrators;");
    const count = parseInt(rows[0].count, 10);

    if (count === 0) {
      const defaultPassword = "Admin1234!";
      const passwordHash = bcrypt.hashSync(defaultPassword, 10);

      await client.query(
        `INSERT INTO administrators (full_name, email, password_hash)
         VALUES ($1, $2, $3);`,
        ["Administrator", "admin@mbugangari.com", passwordHash]
      );

      console.log("✅ Default administrator created: admin@mbugangari.com / Admin1234!");
    }
  } catch (initError) {
    console.error("⚠️ Failed to verify or create default administrator:", initError.message);
  } finally {
    release();
  }
});

module.exports = pool;