const pool = require("../config/db");

// Record an administrator action for the dashboard. Logging must never break
// the request that triggered it, so failures are only reported to the console.
const logActivity = async (req, action, entity, entityId, label) => {
    try {
        await pool.query(
            `INSERT INTO activity_log (admin_id, admin_email, action, entity, entity_id, label)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                req.admin?.id || null,
                req.admin?.email || null,
                action,
                entity,
                entityId || null,
                label ? String(label).slice(0, 255) : null
            ]
        );
    } catch (error) {
        console.error("Activity log failed:", error.message);
    }
};

module.exports = logActivity;
