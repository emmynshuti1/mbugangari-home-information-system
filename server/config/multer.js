const multer = require("multer");

const storage = multer.memoryStorage();

// Allow only image files
const fileFilter = (req, file, cb) => {

  if (["image/jpeg", "image/png", "image/gif", "image/webp"].includes(file.mimetype)) {

    cb(null, true);

  } else {

    cb(
      new Error("Only image files are allowed."),
      false
    );

  }

};

const upload = multer({

  storage,

  fileFilter,

  limits: {

    fileSize: 10 * 1024 * 1024

  }

});

module.exports = upload;
