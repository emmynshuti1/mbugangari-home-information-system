const { createValidator } = require("../utils/validation");

const validateHouse = createValidator({
    name: { label: "House name", required: true, max: 100 },
    owner: { label: "Owner name", required: true, max: 100 },
    description: { label: "Description", required: true, max: 5000 },
    year_built: { label: "Year built", type: "integer", min: 1900, max: new Date().getFullYear() },
    village: { label: "Village", required: true, max: 100 },
    sector: { label: "Sector", required: true, max: 100 },
    district: { label: "District", required: true, max: 100 },
    province: { label: "Province", required: true, max: 100 },
    country: { label: "Country", required: true, max: 100 },
    latitude: { label: "Latitude", type: "number", min: -90, max: 90 },
    longitude: { label: "Longitude", type: "number", min: -180, max: 180 }
});

module.exports = validateHouse;
