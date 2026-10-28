const { createValidator, houseIdRule } = require("../utils/validation");

const validateRoom = createValidator({
    house_id: houseIdRule,
    name: { label: "Room name", required: true, max: 100 },
    floor: { label: "Floor", max: 50 },
    length: { label: "Length", type: "number", exclusiveMin: 0, max: 999.99 },
    width: { label: "Width", type: "number", exclusiveMin: 0, max: 999.99 },
    description: { label: "Description", max: 2000 },
    // Legacy: rooms may reference an external image URL instead of an upload.
    image_url: { label: "Image URL", max: 255 }
});

module.exports = validateRoom;
