const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: [
        'application_received',
        'application_accepted',
        'application_rejected',
        'terms_proposed',
        'terms_accepted',
        'payment_completed',
        'completion_requested',
        'task_completed',
        'review_received',
        'class_enrolled',
        'moderation_approved',
        'moderation_rejected',
        'general',
      ],
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    linkUrl: {
      type: String,
      default: '/',
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ recipientId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

