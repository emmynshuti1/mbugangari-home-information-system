const multer = require("multer");
const ApiError = require("../utils/ApiError");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

// Allow only image files. The real file signature is checked afterwards by
// validateImageFile, because the browser-supplied mimetype can be spoofed.
const fileFilter = (req, file, cb) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new ApiError(400, "Only JPEG, PNG, GIF or WEBP images are allowed."), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_IMAGE_SIZE,
        files: 1,
        fields: 30
    }
});

module.exports = upload;
module.exports.MAX_IMAGE_SIZE = MAX_IMAGE_SIZE;
