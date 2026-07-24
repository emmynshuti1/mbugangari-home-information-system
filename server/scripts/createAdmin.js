require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function createAdmin() {
  try {
    // CHANGE THESE VALUES

    const fullName = "Emmanuel Nshuti";
    const email = "admin@mbugangarihome.com";
    const password = "Admin@12345";

    // Check if admin already exists
    const existingAdmin = await pool.query(
      "SELECT * FROM administrators WHERE email = $1",
      [email]
    );

    if (existingAdmin.rows.length > 0) {
      console.log("❌ Administrator already exists.");
      process.exit();
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert into database
    const result = await pool.query(
      `
      INSERT INTO administrators
      (
        full_name,
        email,
        password_hash
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING id, full_name, email;
      `,
      [
        fullName,
        email,
        passwordHash
      ]
    );

    console.log("=====================================");
    console.log("✅ Administrator Created Successfully");
    console.log("=====================================");

    console.table(result.rows);

    process.exit();

  } catch (error) {

    console.error(error);

    process.exit(1);

  }
}

createAdmin();