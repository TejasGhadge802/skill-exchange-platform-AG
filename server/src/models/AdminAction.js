const mongoose = require('mongoose');

const adminActionSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: [
        'approve_task',
        'reject_task',
        'approve_class',
        'reject_class',
        'resolve_report',
        'dismiss_report',
        'update_user_role',
        'toggle_user_status',
      ],
      required: true,
      index: true,
    },
    targetModel: {
      type: String,
      required: true,
      enum: ['Task', 'Class', 'User', 'Report'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    notes: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

adminActionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdminAction', adminActionSchema);

