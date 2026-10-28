const galleryModel = require("../models/galleryModel");
const houseModel = require("../models/houseModel");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const logActivity = require("../utils/activity");
const { withImageUrl, sendImage } = require("../utils/images");

const serializeImage = image => withImageUrl(image, "/api/gallery");

// Resolve the house an image belongs to: the requested one, or the first house.
const resolveHouseId = async requestedHouseId => {
    if (requestedHouseId) {
        const house = await houseModel.getHouseById(requestedHouseId);

        if (!house) {
            throw new ApiError(
                400,
                "The selected house ID does not exist. Please create house information first or select a valid house."
            );
        }

        return requestedHouseId;
    }

    const houses = await houseModel.getAllHouses();

    if (!houses.length) {
        throw new ApiError(
            400,
            "No house records were found. Create a house before uploading gallery images."
        );
    }

    return houses[0].id;
};

// GET all gallery images
const getAllImages = async (req, res, next) => {

    try {

        const images = await galleryModel.getAllImages();

        return res.status(200).json({

            ...new ApiResponse(

                true,

                "Gallery images retrieved successfully.",

                images.map(serializeImage)

            ),

            count: images.length

        });

    }

    catch (error) {

        next(error);

    }

};

// GET one gallery image record
const getImageById = async (req, res, next) => {
    try {
        const image = await galleryModel.getImageById(req.params.id);

        if (!image) {
            throw new ApiError(404, "Gallery image not found.");
        }

        return res.status(200).json(
            new ApiResponse(true, "Gallery image retrieved successfully.", serializeImage(image))
        );
    } catch (error) {
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

        const houseIdToUse = await resolveHouseId(req.body.house_id);

        const image = await galleryModel.createImage({

            house_id: houseIdToUse,

            image_url: "",

            caption: req.body.caption,

            image_data: req.file.buffer,

            image_mime_type: req.file.mimetype

        });

        await logActivity(req, "create", "gallery", image.id, image.caption || "Gallery image");

        return res.status(201).json(

            new ApiResponse(

                true,

                "Image uploaded successfully.",

                serializeImage(image)

            )

        );

    }

    catch (error) {

        next(error);

    }

};

// PUT update caption and optionally replace the image file
const updateImage = async (req, res, next) => {
    try {
        const existing = await galleryModel.getImageById(req.params.id);

        if (!existing) {
            throw new ApiError(404, "Gallery image not found.");
        }

        const houseId = await resolveHouseId(req.body.house_id || existing.house_id);

        const image = await galleryModel.updateImage(
            req.params.id,
            { house_id: houseId, caption: req.body.caption },
            req.file || null
        );

        await logActivity(
            req,
            "update",
            "gallery",
            image.id,
            `${image.caption || "Gallery image"}${req.file ? " (image replaced)" : ""}`
        );

        return res.status(200).json(
            new ApiResponse(true, "Gallery image updated successfully.", serializeImage(image))
        );
    } catch (error) {
        next(error);
    }
};

const getImageFile = async (req, res, next) => {
    try {
        const image = await galleryModel.getImageFileById(req.params.id);

        if (!image || !image.image_data) {
            throw new ApiError(404, "Gallery image file not found.");
        }

        sendImage(req, res, image);
    } catch (error) {
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

        await logActivity(req, "delete", "gallery", image.id, image.caption || "Gallery image");

        return res.status(200).json(

            new ApiResponse(

                true,

                "Image deleted successfully.",

                serializeImage(image)

            )

        );

    }

    catch (error) {

        next(error);

    }

};

module.exports = {

    getAllImages,

    getImageById,

    getImageFile,

    uploadImage,

    updateImage,

    deleteImage

};
