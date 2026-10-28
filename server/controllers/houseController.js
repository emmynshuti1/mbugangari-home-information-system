const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const logActivity = require("../utils/activity");
const { withImageUrl, sendImage } = require("../utils/images");

const serializeHouse = house => withImageUrl(house, "/api/houses");

// GET /api/houses
const getAllHouses = async (req, res, next) => {

    try {

        const houses = await houseModel.getAllHouses();

        return res.status(200).json({

            ...new ApiResponse(
                true,
                "Houses retrieved successfully",
                houses.map(serializeHouse)
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
                serializeHouse(house)
            )

        );

    }

    catch (error) {

        next(error);

    }

};

// GET /api/houses/:id/image
const getHouseImage = async (req, res, next) => {
    try {
        const image = await houseModel.getHouseImageById(req.params.id);

        if (!image || !image.image_data) {
            throw new ApiError(404, "House image not found.");
        }

        sendImage(req, res, image);
    } catch (error) {
        next(error);
    }
};

// POST /api/houses
const createHouse = async (req, res, next) => {

    try {

        const newHouse = await houseModel.createHouse(req.body, req.file || null);

        await logActivity(req, "create", "house", newHouse.id, newHouse.name);

        return res.status(201).json(

            new ApiResponse(
                true,
                "House created successfully",
                serializeHouse(newHouse)
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
            req.body,
            req.file || null
        );

        if (!updatedHouse) {

            throw new ApiError(
                404,
                "House not found"
            );

        }

        await logActivity(
            req,
            "update",
            "house",
            updatedHouse.id,
            `${updatedHouse.name}${req.file ? " (cover image replaced)" : ""}`
        );

        return res.status(200).json(

            new ApiResponse(
                true,
                "House updated successfully",
                serializeHouse(updatedHouse)
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

        await logActivity(req, "delete", "house", deletedHouse.id, deletedHouse.name);

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
    getHouseImage,
    createHouse,
    updateHouse,
    deleteHouse
};
