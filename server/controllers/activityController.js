const activityModel = require("../models/activityModel");
const ApiResponse = require("../utils/ApiResponse");

// GET /api/activity?limit=15
const getRecentActivity = async (req, res, next) => {
    try {
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 15, 1), 100);
        const activity = await activityModel.getRecentActivity(limit);

        return res.status(200).json({
            ...new ApiResponse(true, "Recent activity retrieved successfully.", activity),
            count: activity.length
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getRecentActivity
};
