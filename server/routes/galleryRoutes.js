const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const protect = require("../middleware/authMiddleware");

const galleryController = require("../controllers/galleryController");

// Public
router.get("/", galleryController.getAllImages);

// Protected
router.post("/upload", protect, upload.single("image"), galleryController.uploadImage);
router.delete("/:id", protect, galleryController.deleteImage);

module.exports = router;