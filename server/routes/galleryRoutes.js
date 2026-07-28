const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const protect = require("../middleware/authMiddleware");

const galleryController = require("../controllers/galleryController");

const validateGallery = require("../middleware/validateGallery");

router.get("/", galleryController.getAllImages);

router.post("/", authenticateToken, upload.single("image"), validateGallery, galleryController.uploadImage);

router.post("/upload", protect, upload.single("image"), galleryController.uploadImage);

router.delete("/:id", protect, galleryController.deleteImage);

module.exports = router;