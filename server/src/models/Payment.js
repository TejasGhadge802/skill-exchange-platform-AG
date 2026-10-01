const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    termsId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NegotiatedTerms',
      default: null,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    razorpayPaymentId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    status: {
      type: String,
      enum: ['created', 'captured', 'failed', 'refunded'],
      default: 'created',
      index: true,
    },
    purpose: {
      type: String,
      enum: ['task_escrow', 'class_fee'],
      default: 'task_escrow',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

