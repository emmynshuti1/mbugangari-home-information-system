const pool = require("../config/db");

const getAdminByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM administrators WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

module.exports = {
  getAdminByEmail,
};