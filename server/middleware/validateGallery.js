const validateGallery = (req, res, next) => {

    const { caption, house_id } = req.body;

    const errors = [];

    // House ID

    if (!house_id || isNaN(Number(house_id))) {

        errors.push("A valid house must be selected.");

    }

    // Caption (optional, but if provided it must not be too long)

    if (caption && caption.trim().length > 255) {

        errors.push("Caption cannot exceed 255 characters.");

    }

    // Image (required only when uploading)

    if (!req.file) {

        errors.push("Please select an image to upload.");

    }

    if (errors.length > 0) {
    return res.status(400).json(
      new ApiResponse(
        false,
        "Validation failed",
        errors
    ));

    }

    next();

};

module.exports = validateGallery;