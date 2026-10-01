const Task = require('../models/Task');
const Class = require('../models/Class');
const Report = require('../models/Report');
const User = require('../models/User');
const AdminAction = require('../models/AdminAction');
const { createNotification } = require('../services/notificationService');

// Get pending moderation tasks
const getPendingTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ status: 'pending_approval' })
      .populate('requesterId', 'displayName email photoURL ratingAverage')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Moderate task (approve / reject)
const moderateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, moderationNotes } = req.body; // 'approve' or 'reject'

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    task.status = newStatus;
    task.moderationNotes = moderationNotes || '';
    await task.save();

    // Immutable audit log
    await AdminAction.create({
      adminId: req.user._id,
      actionType: decision === 'approve' ? 'approve_task' : 'reject_task',
      targetModel: 'Task',
      targetId: task._id,
      notes: moderationNotes || `Task ${decision}d by admin`,
    });

    // Notify requester
    await createNotification({
      recipientId: task.requesterId,
      senderId: req.user._id,
      type: decision === 'approve' ? 'moderation_approved' : 'moderation_rejected',
      title: `Task ${decision === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your task "${task.title}" has been ${decision}d.${moderationNotes ? ` Note: ${moderationNotes}` : ''}`,
      linkUrl: `/tasks/${task._id}`,
    });

    return res.status(200).json({
      success: true,
      message: `Task ${decision}d successfully`,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Get pending moderation classes
const getPendingClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ status: 'pending_approval' })
      .populate('instructorId', 'displayName email photoURL')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

// Moderate class (approve / reject)
const moderateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { decision, moderationNotes } = req.body;

    const classDoc = await Class.findById(id);
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const newStatus = decision === 'approve' ? 'approved' : 'rejected';
    classDoc.status = newStatus;
    classDoc.moderationNotes = moderationNotes || '';
    await classDoc.save();

    // Immutable audit log
    await AdminAction.create({
      adminId: req.user._id,
      actionType: decision === 'approve' ? 'approve_class' : 'reject_class',
      targetModel: 'Class',
      targetId: classDoc._id,
      notes: moderationNotes || `Class ${decision}d by admin`,
    });

    // Notify instructor
    await createNotification({
      recipientId: classDoc.instructorId,
      senderId: req.user._id,
      type: decision === 'approve' ? 'moderation_approved' : 'moderation_rejected',
      title: `Class ${decision === 'approve' ? 'Approved' : 'Rejected'}`,
      message: `Your class "${classDoc.title}" has been ${decision}d.${moderationNotes ? ` Note: ${moderationNotes}` : ''}`,
      linkUrl: `/classes/${classDoc._id}`,
    });

    return res.status(200).json({
      success: true,
      message: `Class ${decision}d successfully`,
      data: classDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Get all reports
const getReports = async (req, res, next) => {
  try {
    const reports = await Report.find()
      .populate('reporterId', 'displayName email photoURL')
      .populate('resolvedById', 'displayName email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

// Resolve report
const resolveReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, resolutionNotes } = req.body; // 'resolved' or 'dismissed'

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedById = req.user._id;
    await report.save();

    await AdminAction.create({
      adminId: req.user._id,
      actionType: status === 'dismissed' ? 'dismiss_report' : 'resolve_report',
      targetModel: 'Report',
      targetId: report._id,
      notes: resolutionNotes || `Report ${status}`,
    });

    return res.status(200).json({
      success: true,
      message: `Report marked as ${status}`,
      data: report,
    });
  } catch (error) {
    next(error);
  }
};

// Get Admin Audit Logs
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AdminAction.find()
      .populate('adminId', 'displayName email')
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    next(error);
  }
};

// List all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

// Update user role / status
const updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role, isActive } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    await user.save();

    await AdminAction.create({
      adminId: req.user._id,
      actionType: 'update_user_role',
      targetModel: 'User',
      targetId: user._id,
      notes: `Updated role to ${role}, isActive: ${isActive}`,
    });

    return res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPendingTasks,
  moderateTask,
  getPendingClasses,
  moderateClass,
  getReports,
  resolveReport,
  getAuditLogs,
  getAllUsers,
  updateUserRole,
};

