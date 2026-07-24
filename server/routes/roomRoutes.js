const express = require("express");

const router = express.Router();

const roomController = require("../controllers/roomController");
const protect = require("../middleware/authMiddleware");
const validateRoom = require("../middleware/validateRoom");

// Public routes
router.get("/", roomController.getAllRooms);

router.get("/:id", roomController.getRoomById);

// Protected routes
router.post("/", protect, validateRoom, roomController.createRoom);

router.put("/:id", protect, validateRoom, roomController.updateRoom);

router.delete("/:id", protect, roomController.deleteRoom);

module.exports = router;