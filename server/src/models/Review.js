const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    revieweeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['requester_to_provider', 'provider_to_requester'],
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce 1 review per reviewer, task, and reviewee
reviewSchema.index({ taskId: 1, reviewerId: 1, revieweeId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);

