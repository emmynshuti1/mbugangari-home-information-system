const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const protect = require("../middleware/authMiddleware");

const galleryController = require("../controllers/galleryController");

const validateGallery = require("../middleware/validateGallery");
const validateImageFile = require("../middleware/validateImageFile");
const validateId = require("../middleware/validateId");

router.param("id", validateId);

router.get("/", galleryController.getAllImages);

router.get("/:id/image", galleryController.getImageFile);

router.get("/:id", galleryController.getImageById);

const uploadImage = [protect, upload.single("image"), validateImageFile, validateGallery, galleryController.uploadImage];

router.post("/", ...uploadImage);

// Alias documented in the README.
router.post("/upload", ...uploadImage);

router.put("/:id", protect, upload.single("image"), validateImageFile, validateGallery, galleryController.updateImage);

router.delete("/:id", protect, galleryController.deleteImage);

module.exports = router;
