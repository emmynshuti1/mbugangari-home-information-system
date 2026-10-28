const { test } = require("node:test");
const assert = require("node:assert/strict");
const validateRoom = require("../middleware/validateRoom");
const validateHistory = require("../middleware/validateHistory");
const validateHouse = require("../middleware/validateHouse");
const validateId = require("../middleware/validateId");

function run(middleware, body) {
    const req = { body };
    const res = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.body = payload; return this; }
    };
    let passed = false;
    middleware(req, res, () => { passed = true; });
    return { req, res, passed };
}

test("sanitizes multipart room fields into typed values", () => {
    const { req, passed } = run(validateRoom, {
        house_id: "1", name: "  Kitchen ", floor: "Ground", length: "5.5", width: "", description: ""
    });
    assert.equal(passed, true);
    assert.equal(req.body.house_id, 1);
    assert.equal(req.body.name, "Kitchen");
    assert.equal(req.body.length, 5.5);
    assert.equal(req.body.width, null);
});

test("rejects non-positive room dimensions with a readable message", () => {
    const { res, passed } = run(validateRoom, { house_id: "1", name: "Hall", length: "0", width: "-2" });
    assert.equal(passed, false);
    assert.equal(res.statusCode, 400);
    assert.match(res.body.message, /Length must be greater than 0/);
    assert.equal(res.body.data.length, 2);
});

test("rejects impossible history dates", () => {
    assert.equal(run(validateHistory, { house_id: 1, title: "T", event_date: "2023-02-30" }).passed, false);
    const ok = run(validateHistory, { house_id: 1, title: "T", event_date: "2023-02-28" });
    assert.equal(ok.passed, true);
    assert.equal(ok.req.body.event_date, "2023-02-28");
});

test("keeps a zero latitude instead of dropping it", () => {
    const { req, passed } = run(validateHouse, {
        name: "H", owner: "O", description: "D", village: "V", sector: "S",
        district: "D", province: "P", country: "C", latitude: "0", longitude: "29.2"
    });
    assert.equal(passed, true);
    assert.equal(req.body.latitude, 0);
});

test("rejects out-of-range coordinates", () => {
    const { passed } = run(validateHouse, {
        name: "H", owner: "O", description: "D", village: "V", sector: "S",
        district: "D", province: "P", country: "C", latitude: "123"
    });
    assert.equal(passed, false);
});

test("validateId rejects non-numeric ids", () => {
    let error;
    validateId({}, {}, err => { error = err; }, "abc");
    assert.equal(error.statusCode, 400);
    validateId({}, {}, err => { error = err; }, "12");
    assert.equal(error, undefined);
});
