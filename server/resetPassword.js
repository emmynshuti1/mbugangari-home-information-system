const bcrypt = require("bcrypt");
const pool = require("./config/db");

async function resetPassword() {
  const email = "admin@mbugangarihome.com";
  const newPassword = "Admin1234!";

  const hash = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE administrators SET password_hash = $1 WHERE email = $2",
    [hash, email]
  );

  console.log("✅ Password reset successfully.");
  console.log("Email:", email);
  console.log("Password:", newPassword);

  process.exit();
}

resetPassword().catch(err => {
  console.error(err);
  process.exit(1);
});