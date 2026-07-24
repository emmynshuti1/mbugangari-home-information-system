const express = require("express");

const router = express.Router();

const houseController = require("../controllers/houseController");

const validateHouse = require("../middleware/validateHouse");

const protect = require("../middleware/authMiddleware");

router.get("/", houseController.getAllHouses);

router.get("/:id", houseController.getHouseById);

router.post("/", protect, validateHouse, houseController.createHouse);

router.put("/:id", protect, validateHouse, houseController.updateHouse);

router.delete("/:id", protect, houseController.deleteHouse);

module.exports = router;