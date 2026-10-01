const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    requesterId: {
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
    requiredSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    workMode: {
      type: String,
      enum: ['remote', 'onsite', 'hybrid'],
      default: 'remote',
      index: true,
    },
    location: {
      type: String,
      default: '',
      trim: true,
    },
    budgetMin: {
      type: Number,
      default: 0,
      min: 0,
    },
    budgetMax: {
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
      enum: [
        'draft',
        'pending_approval',
        'approved',
        'provider_selected',
        'payment_pending',
        'in_progress',
        'completed',
        'cancelled',
        'rejected',
      ],
      default: 'draft',
      index: true,
    },
    assignedProviderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    selectedApplicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      default: null,
    },
    moderationNotes: {
      type: String,
      default: '',
    },
    completionRequestedByProvider: {
      type: Boolean,
      default: false,
    },
    completionConfirmedByRequester: {
      type: Boolean,
      default: false,
    },
    deadline: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.index({ title: 'text', description: 'text', requiredSkills: 'text' });
taskSchema.index({ status: 1, category: 1, budgetMax: 1 });
taskSchema.index({ requesterId: 1, status: 1 });
taskSchema.index({ assignedProviderId: 1, status: 1 });

module.exports = mongoose.model('Task', taskSchema);

