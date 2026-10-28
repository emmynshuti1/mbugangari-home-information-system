const express = require("express");

const router = express.Router();

const houseController = require("../controllers/houseController");

const validateHouse = require("../middleware/validateHouse");
const validateImageFile = require("../middleware/validateImageFile");
const validateId = require("../middleware/validateId");
const upload = require("../config/multer");

const protect = require("../middleware/authMiddleware");

router.param("id", validateId);

router.get("/", houseController.getAllHouses);

router.get("/:id/image", houseController.getHouseImage);

router.get("/:id", houseController.getHouseById);

// Accepts JSON, or multipart/form-data with an optional "image" cover photo.
router.post("/", protect, upload.single("image"), validateImageFile, validateHouse, houseController.createHouse);

router.put("/:id", protect, upload.single("image"), validateImageFile, validateHouse, houseController.updateHouse);

router.delete("/:id", protect, houseController.deleteHouse);

module.exports = router;
