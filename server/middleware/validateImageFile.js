const ApiError = require("../utils/ApiError");

const signatures = [
    { mime: "image/jpeg", matches: buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
    { mime: "image/png", matches: buffer => buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
    { mime: "image/gif", matches: buffer => buffer.length >= 6 && ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii")) },
    { mime: "image/webp", matches: buffer => buffer.length >= 12 && buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP" }
];

function detectImageMime(buffer) {
    if (!buffer) return null;
    const detected = signatures.find(signature => signature.matches(buffer));
    return detected ? detected.mime : null;
}

function validateImageFile(req, res, next) {
    if (!req.file) return next();

    const detected = signatures.find(signature => signature.matches(req.file.buffer));
    if (!detected) {
        return next(new ApiError(400, "Upload a valid JPEG, PNG, GIF, or WEBP image."));
    }

    req.file.mimetype = detected.mime;
    next();
}

module.exports = validateImageFile;
module.exports.detectImageMime = detectImageMime;
