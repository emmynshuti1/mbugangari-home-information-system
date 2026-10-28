const { createValidator, houseIdRule } = require("../utils/validation");

// house_id is optional: when omitted the controller uses the first house.
const validateGallery = createValidator({
    house_id: { ...houseIdRule, required: false },
    caption: { label: "Caption", max: 255 }
});

module.exports = validateGallery;
