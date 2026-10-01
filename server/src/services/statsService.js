const User = require('../models/User');
const Task = require('../models/Task');
const Application = require('../models/Application');
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const Review = require('../models/Review');

const updateUserRatings = async (userId) => {
  try {
    const reviews = await Review.find({ revieweeId: userId });
    const count = reviews.length;
    const average = count > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await User.findByIdAndUpdate(userId, {
      ratingAverage: Math.round(average * 10) / 10,
      ratingCount: count,
    });
  } catch (error) {
    console.error('[StatsService updateUserRatings Error]:', error);
  }
};

const getDashboardAnalytics = async (user) => {
  const userId = user._id;
  const role = user.role;

  const result = {
    role,
    userProfile: {
      displayName: user.displayName,
      email: user.email,
      ratingAverage: user.ratingAverage,
      ratingCount: user.ratingCount,
      earningsTotal: user.earningsTotal,
    },
  };

  if (role === 'requester' || role === 'admin') {
    const [totalPosted, activeTasks, completedTasks, pendingProposals] = await Promise.all([
      Task.countDocuments({ requesterId: userId }),
      Task.countDocuments({ requesterId: userId, status: { $in: ['approved', 'provider_selected', 'payment_pending', 'in_progress'] } }),
      Task.countDocuments({ requesterId: userId, status: 'completed' }),
      Application.countDocuments({
        taskId: { $in: await Task.find({ requesterId: userId, status: 'approved' }).distinct('_id') },
        status: 'pending',
      }),
    ]);

    result.requesterStats = {
      totalPosted,
      activeTasks,
      completedTasks,
      pendingProposals,
    };
  }

  if (role === 'provider' || role === 'admin') {
    const [totalApplications, activeProjects, completedProjects, earnedPayments] = await Promise.all([
      Application.countDocuments({ providerId: userId }),
      Task.countDocuments({ assignedProviderId: userId, status: { $in: ['in_progress', 'payment_pending'] } }),
      Task.countDocuments({ assignedProviderId: userId, status: 'completed' }),
      Payment.find({ payeeId: userId, status: 'captured' }),
    ]);

    const calculatedEarnings = earnedPayments.reduce((acc, p) => acc + p.amount, 0);

    result.providerStats = {
      totalApplications,
      activeProjects,
      completedProjects,
      totalEarnings: calculatedEarnings || user.earningsTotal,
    };
  }

  if (role === 'instructor' || role === 'admin') {
    const [totalClasses, publishedClasses, totalStudents] = await Promise.all([
      Class.countDocuments({ instructorId: userId }),
      Class.countDocuments({ instructorId: userId, status: 'approved' }),
      Enrollment.countDocuments({
        classId: { $in: await Class.find({ instructorId: userId }).distinct('_id') },
        status: 'enrolled',
      }),
    ]);

    result.instructorStats = {
      totalClasses,
      publishedClasses,
      totalStudents,
    };
  }

  if (role === 'admin') {
    const [
      totalUsers,
      pendingTasks,
      pendingClasses,
      unresolvedReports,
      totalPaymentsCaptured,
    ] = await Promise.all([
      User.countDocuments(),
      Task.countDocuments({ status: 'pending_approval' }),
      Class.countDocuments({ status: 'pending_approval' }),
      Report.countDocuments({ status: { $in: ['pending', 'investigating'] } }),
      Payment.aggregate([
        { $match: { status: 'captured' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    result.adminStats = {
      totalUsers,
      pendingTasks,
      pendingClasses,
      unresolvedReports,
      platformVolume: totalPaymentsCaptured[0]?.totalAmount || 0,
    };
  }

  return result;
};

module.exports = {
  updateUserRatings,
  getDashboardAnalytics,
};

