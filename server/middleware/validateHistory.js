const validateHistory = (req, res, next) => {

    const {
        house_id,
        title
    } = req.body;

    const errors = [];

    if (!house_id) {
        errors.push("House ID is required.");
    }

    if (!title || title.trim() === "") {
        errors.push("Title is required.");
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

module.exports = validateHistory;