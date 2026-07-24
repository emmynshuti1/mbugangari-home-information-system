class ApiError extends Error {

    constructor(statusCode, message) {

        super(message);

        this.statusCode = statusCode;

    }

}

throw new ApiError(

    404,

    "House not found"

);

module.exports = ApiError;