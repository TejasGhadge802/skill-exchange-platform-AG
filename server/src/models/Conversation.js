const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    lastMessageSenderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.index({ taskId: 1, requesterId: 1, providerId: 1 }, { unique: true });
conversationSchema.index({ requesterId: 1, lastMessageAt: -1 });
conversationSchema.index({ providerId: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);

