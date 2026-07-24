// controllers/galleryController.js

const galleryModel = require("../models/galleryModel");
const houseModel = require("../models/houseModel");

// GET all gallery images
const getAllImages = async (req, res) => {
  try {
    const images = await galleryModel.getAllImages();

    res.status(200).json({
      success: true,
      count: images.length,
      data: images,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST upload image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an image.",
      });
    }

    const requestedHouseId = req.body.house_id ? Number(req.body.house_id) : null;
    let houseIdToUse = null;

    if (requestedHouseId) {
      const house = await houseModel.getHouseById(requestedHouseId);
      if (!house) {
        return res.status(400).json({
          success: false,
          message:
            "The selected house ID does not exist. Please create house information first or select a valid house.",
        });
      }
      houseIdToUse = requestedHouseId;
    } else {
      const houses = await houseModel.getAllHouses();
      if (!houses.length) {
        return res.status(400).json({
          success: false,
          message: "No house records were found. Create a house before uploading gallery images.",
        });
      }
      houseIdToUse = houses[0].id;
    }

    const image = await galleryModel.createImage({
      house_id: houseIdToUse,
      image_url: `/uploads/${req.file.filename}`,
      caption: req.body.caption,
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      data: image,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const deleteImage = async (req, res) => {
  try {
    const image = await galleryModel.deleteImage(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Gallery image not found."
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully.",
      data: image
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getAllImages,
  uploadImage,
  deleteImage
};