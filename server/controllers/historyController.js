const historyModel = require("../models/historyModel");
const houseModel = require("../models/houseModel");

// Get all history
const getAllHistory = async (req, res) => {
    try {
        const history = await historyModel.getAllHistory();

        res.status(200).json({
            success: true,
            count: history.length,
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get history by ID
const getHistoryById = async (req, res) => {
    try {

        const history = await historyModel.getHistoryById(req.params.id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "History record not found."
            });
        }

        res.status(200).json({
            success: true,
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create history
const createHistory = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please create the house first or select an existing house.",
            });
        }

        const history = await historyModel.createHistory(req.body);

        res.status(201).json({
            success: true,
            message: "History record created successfully.",
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update history
const updateHistory = async (req, res) => {
    try {
        const house = await houseModel.getHouseById(req.body.house_id);
        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please choose a valid house.",
            });
        }

        const history = await historyModel.updateHistory(req.params.id, req.body);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "History record not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "History updated successfully.",
            data: history
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete history
const deleteHistory = async (req, res) => {
    try {

        const history = await historyModel.deleteHistory(req.params.id);

        if (!history) {
            return res.status(404).json({
                success: false,
                message: "History record not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "History deleted successfully."
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllHistory,
    getHistoryById,
    createHistory,
    updateHistory,
    deleteHistory
};