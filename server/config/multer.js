const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1000000);

    cb(
      null,
      uniqueName + path.extname(file.originalname)
    );
  }

});

// Allow only image files
const fileFilter = (req, file, cb) => {

  if (
    file.mimetype.startsWith("image/")
  ) {

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

    fileSize: 100 * 1024 * 1024

  }

});

module.exports = upload;