class ApiResponse {

    constructor(success, message, data = null) {

        this.success = success;
        this.message = message;
        this.data = data;

    }

}

res.json(

    new ApiResponse(

        true,

        "House Created",

        house

    )

);

module.exports = ApiResponse;