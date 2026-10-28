const { createValidator, houseIdRule } = require("../utils/validation");

const validateMaterial = createValidator({
    house_id: houseIdRule,
    component: { label: "Component", required: true, max: 100 },
    material_name: { label: "Material name", required: true, max: 100 },
    description: { label: "Description", max: 2000 }
});

module.exports = validateMaterial;
