const User = require('../models/User');
const { getDashboardAnalytics } = require('../services/statsService');

const getUserProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      'displayName email photoURL role bio skills hourlyRate location ratingAverage ratingCount earningsTotal createdAt'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const analytics = await getDashboardAnalytics(req.user);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfileById,
  getDashboardStats,
};

