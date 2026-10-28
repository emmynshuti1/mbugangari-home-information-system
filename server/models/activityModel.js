const pool = require("../config/db");

const getRecentActivity = async (limit = 15) => {
    const result = await pool.query(
        `
        SELECT id, admin_email, action, entity, entity_id, label, created_at
        FROM activity_log
        ORDER BY created_at DESC, id DESC
        LIMIT $1;
        `,
        [limit]
    );

    return result.rows;
};

module.exports = {
    getRecentActivity
};
