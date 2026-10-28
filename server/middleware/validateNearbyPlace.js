const { createValidator, houseIdRule } = require("../utils/validation");

const validateNearbyPlace = createValidator({
    house_id: houseIdRule,
    name: { label: "Place name", required: true, max: 100 },
    category: { label: "Category", max: 50 },
    distance_meters: { label: "Distance", type: "integer", min: 0, max: 1000000 },
    description: { label: "Description", max: 2000 }
});

module.exports = validateNearbyPlace;
