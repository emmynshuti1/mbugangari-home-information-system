const express = require("express");

const router = express.Router();

const materialController = require("../controllers/materialController");
const protect = require("../middleware/authMiddleware");
const validateMaterial = require("../middleware/validateMaterial");

// Public routes
router.get("/", materialController.getAllMaterials);
router.get("/:id", materialController.getMaterialById);

// Protected routes
router.post("/", protect, validateMaterial, materialController.createMaterial);
router.put("/:id", protect, validateMaterial, materialController.updateMaterial);
router.delete("/:id", protect, materialController.deleteMaterial);

module.exports = router;