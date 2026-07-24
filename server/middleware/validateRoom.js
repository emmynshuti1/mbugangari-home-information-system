// middleware/validateRoom.js

const validateRoom = (req, res, next) => {
  const {
    house_id,
    name,
    floor,
    length,
    width,
    description
  } = req.body;

  const errors = [];

  // Required fields
  if (!house_id) {
    errors.push("House ID is required.");
  }

  if (!name || name.trim() === "") {
    errors.push("Room name is required.");
  }

  // Optional validations
  if (length !== undefined && isNaN(Number(length))) {
    errors.push("Length must be a valid number.");
  }

  if (width !== undefined && isNaN(Number(width))) {
    errors.push("Width must be a valid number.");
  }

  if (floor && floor.length > 50) {
    errors.push("Floor cannot exceed 50 characters.");
  }

  if (description && description.length > 1000) {
    errors.push("Description is too long.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors
    });
  }

  next();
};

module.exports = validateRoom;