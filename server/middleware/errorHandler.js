const multer = require("multer");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

// PostgreSQL error codes caused by bad input rather than a server fault.
const databaseClientErrors = {
    "22001": [400, "One of the values is too long."],
    "22003": [400, "One of the numeric values is out of range."],
    "22007": [400, "One of the dates is invalid."],
    "22P02": [400, "One of the values has an invalid format."],
    "23502": [400, "A required value is missing."],
    "23503": [400, "The selected house does not exist."],
    "23505": [409, "A record with this value already exists."],
    "23514": [400, "One of the values is outside the allowed range."]
};

const errorHandler = (err, req, res, next) => {
    const isClientError = err instanceof ApiError || (err.statusCode && err.statusCode < 500);

    if (!isClientError) {
        console.error(err);
    }

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 10 MB or smaller."
            : err.code === "LIMIT_UNEXPECTED_FILE"
                ? "Only one image, sent in the \"image\" field, can be uploaded."
                : "The uploaded file could not be processed.";
        return res.status(400).json(new ApiResponse(false, message));
    }

    if (isClientError) {
        return res.status(err.statusCode || 400).json(
            new ApiResponse(false, err.message || "Request failed.")
        );
    }

    if (databaseClientErrors[err.code]) {
        const [status, message] = databaseClientErrors[err.code];
        return res.status(status).json(new ApiResponse(false, message));
    }

    const exposeInternal = process.env.NODE_ENV !== "production";

    return res.status(500).json(
        new ApiResponse(
            false,
            exposeInternal && err.message ? err.message : "Internal Server Error"
        )
    );
};

module.exports = errorHandler;
