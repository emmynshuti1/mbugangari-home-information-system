const historyModel = require("../models/historyModel");
const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// Get all history
const getAllHistory = async (req, res, next) => {

    try {

        const history = await historyModel.getAllHistory();

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "History retrieved successfully.",

                history

            ),

            count: history.length

        });

    }

    catch (error) {

        next(error);

    }

};

// Get history by ID
const getHistoryById = async (req, res, next) => {

    try {

        const history = await historyModel.getHistoryById(req.params.id);

        if (!history) {

            throw new ApiError(

                404,

                "History record not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "History retrieved successfully.",

                history

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Create history
const createHistory = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please create the house first or select an existing house."

            );

        }

        const history = await historyModel.createHistory(req.body);

        return res.status(201).json(

            new ApiResponse(

                true,

                "History record created successfully.",

                history

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Update history
const updateHistory = async (req, res, next) => {

    try {

        const house = await houseModel.getHouseById(req.body.house_id);

        if (!house) {

            throw new ApiError(

                400,

                "The selected house does not exist. Please choose a valid house."

            );

        }

        const history = await historyModel.updateHistory(

            req.params.id,

            req.body

        );

        if (!history) {

            throw new ApiError(

                404,

                "History record not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "History updated successfully.",

                history

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// Delete history
const deleteHistory = async (req, res, next) => {

    try {

        const history = await historyModel.deleteHistory(req.params.id);

        if (!history) {

            throw new ApiError(

                404,

                "History record not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "History deleted successfully."

            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getAllHistory,

    getHistoryById,

    createHistory,

    updateHistory,

    deleteHistory

};