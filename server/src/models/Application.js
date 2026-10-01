const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    pitch: {
      type: String,
      required: true,
      trim: true,
    },
    proposedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    proposedDurationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['pending', 'shortlisted', 'accepted', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce 1 application per provider per task
applicationSchema.index({ taskId: 1, providerId: 1 }, { unique: true });
applicationSchema.index({ providerId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);

