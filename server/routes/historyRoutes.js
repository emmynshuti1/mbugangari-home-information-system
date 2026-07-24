const express = require("express");

const router = express.Router();

const historyController = require("../controllers/historyController");
const protect = require("../middleware/authMiddleware");
const validateHistory = require("../middleware/validateHistory");

// Public routes
router.get("/", historyController.getAllHistory);
router.get("/:id", historyController.getHistoryById);

// Protected routes
router.post("/", protect, validateHistory, historyController.createHistory);
router.put("/:id", protect, validateHistory, historyController.updateHistory);
router.delete("/:id", protect, historyController.deleteHistory);

module.exports = router;