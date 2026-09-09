const { test } = require("node:test");
const assert = require("node:assert/strict");
const errorHandler = require("../middleware/errorHandler");
const ApiError = require("../utils/ApiError");

function mockResponse() {
    return {
        statusCode: null,
        body: null,
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.body = payload;
            return this;
        }
    };
}

test("returns public ApiError messages", () => {
    const req = {};
    const res = mockResponse();
    errorHandler(new ApiError(400, "House ID is required."), req, res, () => {});
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.message, "House ID is required.");
});

test("hides internal errors in production", () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const req = {};
    const res = mockResponse();
    errorHandler(new Error("relation galleries does not exist"), req, res, () => {});
    process.env.NODE_ENV = previous;
    assert.equal(res.statusCode, 500);
    assert.equal(res.body.message, "Internal Server Error");
});
