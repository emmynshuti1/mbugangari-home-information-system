const materialModel = require("../models/materialModel");
const houseModel = require("../models/houseModel");

// Get all materials
const getAllMaterials = async (req, res) => {
    try {
        const materials = await materialModel.getAllMaterials();

        res.status(200).json({
            success: true,
            count: materials.length,
            data: materials
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get material by ID
const getMaterialById = async (req, res) => {
    try {

        const material = await materialModel.getMaterialById(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found."
            });
        }

        res.status(200).json({
            success: true,
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create material
const createMaterial = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please create the house first or select an existing house.",
            });
        }

        const material = await materialModel.createMaterial(req.body);

        res.status(201).json({
            success: true,
            message: "Material added successfully.",
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update material
const updateMaterial = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please choose a valid house.",
            });
        }

        const material = await materialModel.updateMaterial(
            req.params.id,
            req.body
        );

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Material updated successfully.",
            data: material
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete material
const deleteMaterial = async (req, res) => {
    try {

        const material = await materialModel.deleteMaterial(req.params.id);

        if (!material) {
            return res.status(404).json({
                success: false,
                message: "Material not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Material deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllMaterials,
    getMaterialById,
    createMaterial,
    updateMaterial,
    deleteMaterial
};