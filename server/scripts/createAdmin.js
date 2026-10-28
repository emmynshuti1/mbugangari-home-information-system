// Create an administrator, or reset the password of an existing one.
//
// Usage (from the server directory):
//   ADMIN_NAME="Full Name" ADMIN_EMAIL=you@example.com ADMIN_PASSWORD="long password" npm run create-admin
//
// Credentials are read from environment variables so they never end up in
// shell history files or in the repository.
require("../config/loadEnv");

const bcrypt = require("bcrypt");
const pool = require("../config/db");

async function main() {
    const fullName = (process.env.ADMIN_NAME || "Administrator").trim();
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "";

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        throw new Error("Set ADMIN_EMAIL to a valid email address.");
    }

    if (password.length < 10) {
        throw new Error("Set ADMIN_PASSWORD to at least 10 characters.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const { rows } = await pool.query(
        `INSERT INTO administrators (full_name, email, password_hash)
         VALUES ($1, $2, $3)
         ON CONFLICT (email) DO UPDATE
            SET full_name = EXCLUDED.full_name, password_hash = EXCLUDED.password_hash
         RETURNING id, email, (xmax = 0) AS created`,
        [fullName, email, passwordHash]
    );

    console.log(`${rows[0].created ? "Created" : "Updated"} administrator ${rows[0].email} (ID ${rows[0].id}).`);
}

main()
    .catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    })
    .finally(() => pool.end());
