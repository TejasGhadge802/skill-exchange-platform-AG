const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetType: {
      type: String,
      enum: ['task', 'class', 'user', 'message'],
      required: true,
      index: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    details: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'investigating', 'resolved', 'dismissed'],
      default: 'pending',
      index: true,
    },
    resolvedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);

