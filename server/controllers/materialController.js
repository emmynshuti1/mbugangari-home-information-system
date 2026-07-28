const materialModel = require("../models/materialModel");
const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Get all materials
const getAllMaterials = async (req, res, next) => {

    try {

        const materials = await materialModel.getAllMaterials();

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "Materials retrieved successfully.",

                materials

            ),

            count: materials.length

        });

    }

    catch (error) {

        next(error);

    }

};

// Get material by ID
const getMaterialById = async (req, res, next) => {

    try {

        const material = await materialModel.getMaterialById(req.params.id);

        if (!material) {

            throw new ApiError(

                404,

                "Material not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Material retrieved successfully.",

                material

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Create material
const createMaterial = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please create the house first or select an existing house."

            );

        }

        const material = await materialModel.createMaterial(req.body);

        return res.status(201).json(

            new ApiResponse(

                true,

                "Material added successfully.",

                material

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Update material
const updateMaterial = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please choose a valid house."

            );

        }

        const material = await materialModel.updateMaterial(

            req.params.id,

            req.body

        );

        if (!material) {

            throw new ApiError(

                404,

                "Material not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Material updated successfully.",

                material

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Delete material
const deleteMaterial = async (req, res, next) => {

    try {

        const material = await materialModel.deleteMaterial(req.params.id);

        if (!material) {

            throw new ApiError(

                404,

                "Material not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Material deleted successfully."

            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getAllMaterials,

    getMaterialById,

    createMaterial,

    updateMaterial,

    deleteMaterial

};