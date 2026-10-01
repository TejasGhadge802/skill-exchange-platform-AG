const mongoose = require('mongoose');

const negotiatedTermsSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    proposedById: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    durationDays: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: '',
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
    requesterAccepted: {
      type: Boolean,
      default: false,
    },
    requesterAcceptedAt: {
      type: Date,
      default: null,
    },
    providerAccepted: {
      type: Boolean,
      default: false,
    },
    providerAcceptedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['proposed', 'mutually_accepted', 'superseded'],
      default: 'proposed',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

negotiatedTermsSchema.index({ conversationId: 1, version: -1 });

module.exports = mongoose.model('NegotiatedTerms', negotiatedTermsSchema);

