const ApiResponse = require("./ApiResponse");

// Small schema-driven validator. Each rule describes one body field; the
// sanitized values replace req.body so models receive trimmed strings,
// numbers, and nulls for empty optional fields.
//
// Rule options:
//   type: "text" | "number" | "integer" | "date"
//   label, required, max (text length or numeric max), min, exclusiveMin

const isEmpty = value => value === undefined || value === null || String(value).trim() === "";

function validateField(rule, raw, errors) {
    const { label, required = false, type = "text" } = rule;

    if (isEmpty(raw)) {
        if (required) errors.push(`${label} is required.`);
        return type === "text" && !required ? "" : null;
    }

    if (typeof raw === "object") {
        errors.push(`${label} has an invalid value.`);
        return null;
    }

    if (type === "text") {
        const value = String(raw).trim();
        if (rule.max && value.length > rule.max) {
            errors.push(`${label} cannot exceed ${rule.max} characters.`);
        }
        return value;
    }

    if (type === "date") {
        const value = String(raw).trim();
        const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
        const date = match && new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]));
        if (!match || date.getUTCMonth() !== +match[2] - 1) {
            errors.push(`${label} must be a valid date (YYYY-MM-DD).`);
            return null;
        }
        return match[0];
    }

    const value = Number(raw);

    if (!Number.isFinite(value) || (type === "integer" && !Number.isInteger(value))) {
        errors.push(`${label} must be a valid ${type === "integer" ? "whole number" : "number"}.`);
        return null;
    }

    if (rule.exclusiveMin !== undefined && value <= rule.exclusiveMin) {
        errors.push(`${label} must be greater than ${rule.exclusiveMin}.`);
    } else if (rule.min !== undefined && value < rule.min) {
        errors.push(`${label} must be at least ${rule.min}.`);
    }

    if (rule.max !== undefined && value > rule.max) {
        errors.push(`${label} cannot be greater than ${rule.max}.`);
    }

    return value;
}

const houseIdRule = { label: "House", type: "integer", required: true, min: 1, max: 2147483647 };

function createValidator(rules) {
    return (req, res, next) => {
        const body = req.body || {};
        const errors = [];
        const data = {};

        for (const [field, rule] of Object.entries(rules)) {
            data[field] = validateField(rule, body[field], errors);
        }

        if (errors.length > 0) {
            return res.status(400).json(new ApiResponse(false, errors.join(" "), errors));
        }

        req.body = data;
        next();
    };
}

module.exports = { createValidator, houseIdRule };
