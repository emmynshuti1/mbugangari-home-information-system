const validateMaterial = (req, res, next) => {

    const {
        house_id,
        component,
        material_name
    } = req.body;

    const errors = [];

    if (!house_id) {
        errors.push("House ID is required.");
    }

    if (!component || component.trim() === "") {
        errors.push("Component is required.");
    }

    if (!material_name || material_name.trim() === "") {
        errors.push("Material name is required.");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

module.exports = validateMaterial;