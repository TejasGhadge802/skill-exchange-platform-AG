const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    status: {
      type: String,
      enum: ['enrolled', 'cancelled'],
      default: 'enrolled',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Enforce unique enrollment per student per class
enrollmentSchema.index({ classId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

