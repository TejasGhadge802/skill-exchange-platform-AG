const User = require('../models/User');

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, skills, hourlyRate, location, role } = req.body;

    const allowedUpdates = {};
    if (displayName) allowedUpdates.displayName = displayName;
    if (bio !== undefined) allowedUpdates.bio = bio;
    if (skills && Array.isArray(skills)) allowedUpdates.skills = skills;
    if (hourlyRate !== undefined) allowedUpdates.hourlyRate = Number(hourlyRate);
    if (location !== undefined) allowedUpdates.location = location;

    // Allow switching between requester, provider, instructor
    if (role && ['requester', 'provider', 'instructor'].includes(role) && req.user.role !== 'admin') {
      allowedUpdates.role = role;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMe,
  updateProfile,
};

