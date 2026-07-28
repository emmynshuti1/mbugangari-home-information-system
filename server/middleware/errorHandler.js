const ApiResponse = require("../utils/ApiResponse");

const errorHandler = (err, req, res, next) => {

    console.error(err);

    return res.status(err.statusCode || 500).json(

        new ApiResponse(

            false,

            err.message || "Internal Server Error"

        )

    );

};

module.exports = errorHandler;