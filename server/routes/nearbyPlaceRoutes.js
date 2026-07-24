const express = require("express");

const router = express.Router();

const nearbyPlaceController = require("../controllers/nearbyPlaceController");
const protect = require("../middleware/authMiddleware");
const validateNearbyPlace = require("../middleware/validateNearbyPlace");

// Public
router.get("/", nearbyPlaceController.getAllPlaces);

router.get("/:id", nearbyPlaceController.getPlaceById);

// Protected
router.post(
    "/",
    protect,
    validateNearbyPlace,
    nearbyPlaceController.createPlace
);

router.put(
    "/:id",
    protect,
    validateNearbyPlace,
    nearbyPlaceController.updatePlace
);

router.delete(
    "/:id",
    protect,
    nearbyPlaceController.deletePlace
);

module.exports = router;