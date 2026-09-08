const multer = require("multer");
// Keep the upload in memory long enough to persist it to PostgreSQL.
// A local copy is also created by imageStorage for local development.
const storage = multer.memoryStorage();

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

    fileSize: 10 * 1024 * 1024

  }

});

module.exports = upload;
