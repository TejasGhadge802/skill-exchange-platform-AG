const Notification = require('../models/Notification');

let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const createNotification = async ({ recipientId, senderId = null, type, title, message, linkUrl = '/' }) => {
  try {
    const notification = await Notification.create({
      recipientId,
      senderId,
      type,
      title,
      message,
      linkUrl,
    });

    if (ioInstance) {
      ioInstance.to(`user_${recipientId.toString()}`).emit('new_notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('[NotificationService Error]:', error);
    return null;
  }
};

module.exports = {
  setIO,
  createNotification,
};

