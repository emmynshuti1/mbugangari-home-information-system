const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// GET /api/houses
const getAllHouses = async (req, res, next) => {

    try {

        const houses = await houseModel.getAllHouses();

        return res.status(200).json({

            ...new ApiResponse(
                true,
                "Houses retrieved successfully",
                houses
            ),

            count: houses.length

        });

    }

    catch (error) {

        next(error);

    }

};

// GET /api/houses/:id
const getHouseById = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.params.id);

        if (!house) {

            throw new ApiError(
                404,
                "House not found"
            );

        }

        return res.status(200).json(

            new ApiResponse(
                true,
                "House retrieved successfully",
                house
            )

        );

    }

    catch (error) {

        next(error);

    }

};

// POST /api/houses
const createHouse = async (req, res, next) => {

    try {

        const newHouse = await houseModel.createHouse(req.body);

        return res.status(201).json(

            new ApiResponse(
                true,
                "House created successfully",
                newHouse
            )

        );

    }

    catch (error) {

        next(error);

    }

};

// PUT /api/houses/:id
const updateHouse = async (req, res, next) => {

    try {

        const updatedHouse = await houseModel.updateHouse(
            req.params.id,
            req.body
        );

        if (!updatedHouse) {

            throw new ApiError(
                404,
                "House not found"
            );

        }

        return res.status(200).json(

            new ApiResponse(
                true,
                "House updated successfully",
                updatedHouse
            )

        );

    }

    catch (error) {

        next(error);

    }

};

// DELETE /api/houses/:id
const deleteHouse = async (req, res, next) => {

    try {

        const deletedHouse = await houseModel.deleteHouse(req.params.id);

        if (!deletedHouse) {

            throw new ApiError(
                404,
                "House not found"
            );

        }

        return res.status(200).json(

            new ApiResponse(
                true,
                "House deleted successfully"
            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {
    getAllHouses,
    getHouseById,
    createHouse,
    updateHouse,
    deleteHouse
};