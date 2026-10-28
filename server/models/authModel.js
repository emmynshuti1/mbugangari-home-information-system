const pool = require("../config/db");

const getAdminByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM administrators WHERE LOWER(email) = $1`,
    [email]
  );

  return result.rows[0];
};

const getAdminById = async (id) => {
  const result = await pool.query(
    `SELECT id, full_name, email, created_at FROM administrators WHERE id = $1`,
    [id]
  );

  return result.rows[0];
};

module.exports = {
  getAdminByEmail,
  getAdminById,
};