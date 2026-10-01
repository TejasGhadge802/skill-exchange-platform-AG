const Notification = require('../models/Notification');

// Get my notifications
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .populate('senderId', 'displayName photoURL')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark single notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientId: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipientId: req.user._id, read: false }, { read: true });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};

