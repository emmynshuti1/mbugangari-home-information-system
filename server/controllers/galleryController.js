const galleryModel = require("../models/galleryModel");
const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// GET all gallery images
const getAllImages = async (req, res, next) => {

    try {

        const images = await galleryModel.getAllImages();

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "Gallery images retrieved successfully.",

                images

            ),

            count: images.length

        });

    }

    catch (error) {

        next(error);

    }

};

// POST upload image
const uploadImage = async (req, res, next) => {

    try {

        if (!req.file) {

            throw new ApiError(

                400,

                "Please upload an image."

            );

        }

        const requestedHouseId = req.body.house_id
            ? Number(req.body.house_id)
            : null;

        let houseIdToUse = null;

        if (requestedHouseId) {

            const house = await houseModel.getHouseById(requestedHouseId);

            if (!house) {

                throw new ApiError(

                    400,

                    "The selected house ID does not exist. Please create house information first or select a valid house."

                );

            }

            houseIdToUse = requestedHouseId;

        }

        else {

            const houses = await houseModel.getAllHouses();

            if (!houses.length) {

                throw new ApiError(

                    400,

                    "No house records were found. Create a house before uploading gallery images."

                );

            }

            houseIdToUse = houses[0].id;

        }

        const image = await galleryModel.createImage({

            house_id: houseIdToUse,

            image_url: `/uploads/${req.file.filename}`,

            caption: req.body.caption

        });

        return res.status(201).json(

            new ApiResponse(

                true,

                "Image uploaded successfully.",

                image

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// DELETE image
const deleteImage = async (req, res, next) => {

    try {

        const image = await galleryModel.deleteImage(req.params.id);

        if (!image) {

            throw new ApiError(

                404,

                "Gallery image not found."

            );

        }

        return res.status(200).json(

            new ApiResponse(

                true,

                "Image deleted successfully.",

                image

            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getAllImages,

    uploadImage,

    deleteImage

};