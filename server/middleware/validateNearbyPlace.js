const validateNearbyPlace = (req, res, next) => {

    const {
        house_id,
        name,
        distance_meters
    } = req.body;

    const errors = [];

    if (!house_id) {
        errors.push("House ID is required.");
    }

    if (!name || name.trim() === "") {
        errors.push("Place name is required.");
    }

    if (
        distance_meters !== undefined &&
        Number(distance_meters) < 0
    ) {
        errors.push("Distance must be zero or greater.");
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

module.exports = validateNearbyPlace;