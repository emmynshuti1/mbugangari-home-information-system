const multer = require("multer");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const errorHandler = (err, req, res, next) => {
    console.error(err);

    if (err instanceof multer.MulterError) {
        const message = err.code === "LIMIT_FILE_SIZE"
            ? "Image must be 10 MB or smaller."
            : "The uploaded file could not be processed.";
        return res.status(400).json(new ApiResponse(false, message));
    }

    if (err instanceof ApiError || (err.statusCode && err.statusCode < 500)) {
        return res.status(err.statusCode || 400).json(
            new ApiResponse(false, err.message || "Request failed.")
        );
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
