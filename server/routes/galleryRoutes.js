const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const protect = require("../middleware/authMiddleware");

const galleryController = require("../controllers/galleryController");

const validateGallery = require("../middleware/validateGallery");
const validateImageFile = require("../middleware/validateImageFile");

router.get("/", galleryController.getAllImages);

router.get("/:id/image", galleryController.getImageFile);

router.post("/", protect, upload.single("image"), validateImageFile, validateGallery, galleryController.uploadImage);

router.delete("/:id", protect, galleryController.deleteImage);

module.exports = router;
