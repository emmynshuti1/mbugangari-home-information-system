const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const authModel = require("../models/authModel");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find administrator
    const admin = await authModel.getAdminByEmail(email);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      admin.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin.id,
        email: admin.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    const administrator = {
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
    };

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      administrator,
      admin: administrator,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Internal server error."
    });
  }
};

module.exports = {
  login,
};