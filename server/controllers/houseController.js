const houseModel = require("../models/houseModel");

// GET /api/houses
const getAllHouses = async (req, res) => {
  try {
    const houses = await houseModel.getAllHouses();

    res.status(200).json({
      success: true,
      count: houses.length,
      data: houses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/houses/:id
const getHouseById = async (req, res) => {
  try {
    const house = await houseModel.getHouseById(req.params.id);

    if (!house) {
      return res.status(404).json({
        success: false,
        message: "House not found",
      });
    }

    res.status(200).json({
      success: true,
      data: house,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/houses
const createHouse = async (req, res) => {
  try {
    const newHouse = await houseModel.createHouse(req.body);

    res.status(201).json({
      success: true,
      message: "House created successfully",
      data: newHouse,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/houses/:id
const updateHouse = async (req, res) => {
  try {
    const updatedHouse = await houseModel.updateHouse(
      req.params.id,
      req.body
    );

    if (!updatedHouse) {
      return res.status(404).json({
        success: false,
        message: "House not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "House updated successfully",
      data: updatedHouse,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteHouse = async (req, res) => {
  try {
    const deletedHouse = await houseModel.deleteHouse(req.params.id);

    if (!deletedHouse) {
      return res.status(404).json({
        success: false,
        message: "House not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "House deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllHouses,
  getHouseById,
  createHouse,
  updateHouse,
  deleteHouse,
};