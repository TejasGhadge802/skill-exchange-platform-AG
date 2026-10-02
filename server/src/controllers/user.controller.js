const User = require('../models/User');
const { getDashboardAnalytics } = require('../services/statsService');

const getUserProfileById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select(
      'displayName email photoURL role bio skills hourlyRate location ratingAverage ratingCount earningsTotal portfolioUrl linkedinUrl githubUrl twitterUrl createdAt'
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

const updateMyProfile = async (req, res, next) => {
  try {
    const {
      displayName,
      bio,
      skills,
      hourlyRate,
      location,
      portfolioUrl,
      linkedinUrl,
      githubUrl,
      twitterUrl,
    } = req.body;

    const updates = {};
    if (displayName !== undefined) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (skills !== undefined) updates.skills = skills;
    if (hourlyRate !== undefined) updates.hourlyRate = hourlyRate;
    if (location !== undefined) updates.location = location;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl;
    if (linkedinUrl !== undefined) updates.linkedinUrl = linkedinUrl;
    if (githubUrl !== undefined) updates.githubUrl = githubUrl;
    if (twitterUrl !== undefined) updates.twitterUrl = twitterUrl;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfileById,
  getDashboardStats,
  updateMyProfile,
};

