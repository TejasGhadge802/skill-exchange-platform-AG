const Report = require('../models/Report');

const submitReport = async (req, res, next) => {
  try {
    const { targetType, targetId, reason, details } = req.body;

    const report = await Report.create({
      reporterId: req.user._id,
      targetType,
      targetId,
      reason,
      details: details || '',
      status: 'pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully for admin review',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitReport,
};

