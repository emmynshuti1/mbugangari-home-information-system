const roomModel = require("../models/roomModel");
const houseModel = require("../models/houseModel");

// GET all rooms
const getAllRooms = async (req, res, next) => {
    try {

        const rooms = await roomModel.getAllRooms();

        res.status(200).json({
            success: true,
            count: rooms.length,
            data: rooms
        });

    } catch (error) {
        next(error);
    }
};

// GET room by ID
const getRoomById = async (req, res, next) => {
    try {

        const room = await roomModel.getRoomById(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found."
            });
        }

        res.status(200).json({
            success: true,
            data: room
        });

    } catch (error) {
        next(error);
    }
};

// POST room
const createRoom = async (req, res, next) => {
    try {

        const roomData = {
            ...req.body,
            image_url: req.file ? `/uploads/${req.file.filename}` : req.body.image_url
        };

        const house = await houseModel.getHouseById(roomData.house_id);

        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please create the house first or select an existing house."
            });
        }

        const room = await roomModel.createRoom(roomData);

        res.status(201).json({
            success: true,
            message: "Room created successfully.",
            data: room
        });

    } catch (error) {
        next(error);
    }
};

// PUT room
const updateRoom = async (req, res, next) => {
    try {

        const existingRoom = await roomModel.getRoomById(req.params.id);

        if (!existingRoom) {
            return res.status(404).json({ success: false, message: "Room not found." });
        }

        const roomData = {
            ...req.body,
            image_url: req.file
                ? `/uploads/${req.file.filename}`
                : (req.body.image_url || existingRoom.image_url)
        };

        const house = await houseModel.getHouseById(roomData.house_id);

        if (!house) {
            return res.status(400).json({
                success: false,
                message: "The selected house does not exist. Please choose a valid house."
            });
        }

        const room = await roomModel.updateRoom(req.params.id, roomData);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Room updated successfully.",
            data: room
        });

    } catch (error) {
        next(error);
    }
};

// DELETE room
const deleteRoom = async (req, res, next) => {
    try {

        const room = await roomModel.deleteRoom(req.params.id);

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found."
            });
        }

        res.status(200).json({
            success: true,
            message: "Room deleted successfully."
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllRooms,
    getRoomById,
    createRoom,
    updateRoom,
    deleteRoom
};
