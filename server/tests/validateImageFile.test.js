const { test } = require("node:test");
const assert = require("node:assert/strict");
const { detectImageMime } = require("../middleware/validateImageFile");

test("detects JPEG magic bytes", () => {
    const buffer = Buffer.from([0xff, 0xd8, 0xff, 0x00]);
    assert.equal(detectImageMime(buffer), "image/jpeg");
});

test("detects PNG magic bytes", () => {
    const buffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    assert.equal(detectImageMime(buffer), "image/png");
});

test("rejects non-image bytes", () => {
    assert.equal(detectImageMime(Buffer.from("not an image")), null);
});
