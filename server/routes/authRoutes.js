const express = require("express");

const router = express.Router();

const authController = require("../controllers/authController");

const { loginLimiter } = require("../middleware/rateLimiter");

const protect = require("../middleware/authMiddleware");

router.post("/login", loginLimiter, authController.login);

router.get("/me", protect, authController.getCurrentAdmin);

module.exports = router;