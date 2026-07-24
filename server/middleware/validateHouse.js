// middleware/validateHouse.js

const validateHouse = (req, res, next) => {
  const {
    name,
    owner,
    description,
    year_built,
    village,
    sector,
    district,
    province,
    country,
    latitude,
    longitude,
  } = req.body;

  const errors = [];

  // Required fields
  if (!name || name.trim() === "") {
    errors.push("House name is required.");
  }

  if (!owner || owner.trim() === "") {
    errors.push("Owner name is required.");
  }

  if (!description || description.trim() === "") {
    errors.push("Description is required.");
  }

  if (!village || village.trim() === "") {
    errors.push("Village is required.");
  }

  if (!sector || sector.trim() === "") {
    errors.push("Sector is required.");
  }

  if (!district || district.trim() === "") {
    errors.push("District is required.");
  }

  if (!province || province.trim() === "") {
    errors.push("Province is required.");
  }

  if (!country || country.trim() === "") {
    errors.push("Country is required.");
  }

  // Validate year
  if (year_built && isNaN(Number(year_built))) {
    errors.push("Year built must be a valid number.");
  }

  // Validate latitude
  if (latitude !== undefined && latitude !== null && isNaN(Number(latitude))) {
    errors.push("Latitude must be a valid number.");
  }

  // Validate longitude
  if (longitude !== undefined && longitude !== null && isNaN(Number(longitude))) {
    errors.push("Longitude must be a valid number.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  next();
};

module.exports = validateHouse;