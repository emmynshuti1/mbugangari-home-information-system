const nearbyPlaceModel = require("../models/nearbyPlaceModel");
const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Get all places
const getAllPlaces = async (req, res, next) => {

    try {

        const places = await nearbyPlaceModel.getAllPlaces();

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "Nearby places retrieved successfully.",

                places

            ),

            count: places.length

        });

    }

    catch (error) {

        next(error);

    }

};

// Get one place
const getPlaceById = async (req, res, next) => {

    try {

        const place = await nearbyPlaceModel.getPlaceById(req.params.id);

        if (!place) {

            throw new ApiError(

                404,

                "Nearby place not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Nearby place retrieved successfully.",

                place

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Create place
const createPlace = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please create the house first or select an existing house."

            );

        }

        const place = await nearbyPlaceModel.createPlace(req.body);

        return res.status(201).json(

            new ApiResponse(

                true,

                "Nearby place added successfully.",

                place

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Update place
const updatePlace = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please choose a valid house."

            );

        }

        const place = await nearbyPlaceModel.updatePlace(

            req.params.id,

            req.body

        );

        if (!place) {

            throw new ApiError(

                404,

                "Nearby place not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Nearby place updated successfully.",

                place

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Delete place
const deletePlace = async (req, res, next) => {

    try {

        const place = await nearbyPlaceModel.deletePlace(req.params.id);

        if (!place) {

            throw new ApiError(

                404,

                "Nearby place not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Nearby place deleted successfully."

            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getAllPlaces,

    getPlaceById,

    createPlace,

    updatePlace,

    deletePlace

};