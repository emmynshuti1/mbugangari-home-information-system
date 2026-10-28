const ApiError = require("../utils/ApiError");

// Used with router.param("id", validateId) so a malformed id returns 400
// instead of reaching PostgreSQL and failing as an integer cast error.
const validateId = (req, res, next, value) => {
    if (!/^\d+$/.test(String(value)) || Number(value) < 1 || Number(value) > 2147483647) {
        return next(new ApiError(400, "Invalid ID."));
    }

    next();
};

module.exports = validateId;
