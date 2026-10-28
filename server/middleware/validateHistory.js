const { createValidator, houseIdRule } = require("../utils/validation");

const validateHistory = createValidator({
    house_id: houseIdRule,
    title: { label: "Title", required: true, max: 150 },
    description: { label: "Description", max: 5000 },
    event_date: { label: "Event date", type: "date" }
});

module.exports = validateHistory;
