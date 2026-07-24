const nearbyPlaceModel = require("../models/nearbyPlaceModel");
const houseModel = require("../models/houseModel");

// Get all places
const getAllPlaces = async (req, res) => {

    try {

        const places = await nearbyPlaceModel.getAllPlaces();

        res.status(200).json({
            success: true,
            count: places.length,
            data: places
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Get one place
const getPlaceById = async (req, res) => {

    try {

        const place = await nearbyPlaceModel.getPlaceById(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Nearby place not found."
            });
        }

        res.status(200).json({
            success: true,
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Create place
const createPlace = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please create the house first or select an existing house.",
            });
        }

        const place = await nearbyPlaceModel.createPlace(req.body);

        res.status(201).json({
            success: true,
            message: "Nearby place added successfully.",
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Update place
const updatePlace = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please choose a valid house.",
            });
        }

        const place = await nearbyPlaceModel.updatePlace(req.params.id, req.body);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Nearby place not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Nearby place updated successfully.",
            data: place
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// Delete place
const deletePlace = async (req, res) => {

    try {

        const place = await nearbyPlaceModel.deletePlace(req.params.id);

        if (!place) {
            return res.status(404).json({
                success: false,
                message: "Nearby place not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Nearby place deleted successfully."
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

module.exports = {
    getAllPlaces,
    getPlaceById,
    createPlace,
    updatePlace,
    deletePlace
};