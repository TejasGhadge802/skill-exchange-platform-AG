const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    currentEnrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
    scheduleDate: {
      type: Date,
      required: true,
      index: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
    },
    meetingUrl: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'completed', 'cancelled', 'rejected'],
      default: 'draft',
      index: true,
    },
    moderationNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

classSchema.index({ title: 'text', description: 'text', category: 'text' });
classSchema.index({ status: 1, scheduleDate: 1 });

module.exports = mongoose.model('Class', classSchema);

