const Application = require('../models/Application');
const Task = require('../models/Task');
const Conversation = require('../models/Conversation');
const NegotiatedTerms = require('../models/NegotiatedTerms');
const { createNotification } = require('../services/notificationService');

// Submit proposal for a task
const applyToTask = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const { pitch, proposedPrice, proposedDurationDays } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Applications can only be submitted for approved tasks',
      });
    }

    if (task.requesterId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot submit a proposal for your own task',
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      taskId,
      providerId: req.user._id,
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a proposal for this task',
      });
    }

    const application = await Application.create({
      taskId,
      providerId: req.user._id,
      pitch,
      proposedPrice: Number(proposedPrice),
      proposedDurationDays: Number(proposedDurationDays),
      status: 'pending',
    });

    // Notify requester
    await createNotification({
      recipientId: task.requesterId,
      senderId: req.user._id,
      type: 'application_received',
      title: 'New Proposal Received',
      message: `${req.user.displayName} applied for your task "${task.title}" with a bid of ₹${proposedPrice}.`,
      linkUrl: `/tasks/${task._id}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Proposal submitted successfully',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Get all applications for a task (only task requester can view)
const getTaskApplications = async (req, res, next) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to view proposals for this task' });
    }

    const applications = await Application.find({ taskId })
      .populate('providerId', 'displayName email photoURL bio ratingAverage ratingCount skills hourlyRate')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Get current provider's applications
const getMyApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ providerId: req.user._id })
      .populate('taskId', 'title category budgetMax status workMode location requesterId')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    next(error);
  }
};

// Shortlist an applicant
const shortlistApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('taskId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.taskId.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    application.status = 'shortlisted';
    await application.save();

    return res.status(200).json({
      success: true,
      message: 'Applicant shortlisted',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Reject an applicant
const rejectApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('taskId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (application.taskId.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    application.status = 'rejected';
    await application.save();

    await createNotification({
      recipientId: application.providerId,
      senderId: req.user._id,
      type: 'application_rejected',
      title: 'Proposal Update',
      message: `Your proposal for "${application.taskId.title}" was not selected.`,
      linkUrl: `/tasks/${application.taskId._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Applicant rejected',
      data: application,
    });
  } catch (error) {
    next(error);
  }
};

// Transactional Provider Acceptance: Accepts one applicant, auto-rejects others, creates conversation & terms
const acceptApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('taskId');

    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    const task = application.taskId;

    if (task.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['approved', 'pending_approval', 'draft'].includes(task.status) && task.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Task is currently in '${task.status}' state and cannot accept proposals.`,
      });
    }

    // 1. Mark selected application as accepted
    application.status = 'accepted';
    await application.save();

    // 2. Update task with assigned provider and state
    task.status = 'provider_selected';
    task.assignedProviderId = application.providerId;
    task.selectedApplicationId = application._id;
    await task.save();

    // 3. Auto-reject all other pending or shortlisted applicants for this task
    const otherApps = await Application.find({
      taskId: task._id,
      _id: { $ne: application._id },
      status: { $in: ['pending', 'shortlisted'] },
    });

    for (const other of otherApps) {
      other.status = 'rejected';
      await other.save();

      await createNotification({
        recipientId: other.providerId,
        senderId: req.user._id,
        type: 'application_rejected',
        title: 'Task Proposal Update',
        message: `Another provider was selected for task "${task.title}".`,
        linkUrl: `/tasks/${task._id}`,
      });
    }

    // 4. Create or find conversation
    let conversation = await Conversation.findOne({
      taskId: task._id,
      requesterId: task.requesterId,
      providerId: application.providerId,
    });

    if (!conversation) {
      conversation = await Conversation.create({
        taskId: task._id,
        requesterId: task.requesterId,
        providerId: application.providerId,
        lastMessage: `Provider accepted with bid ₹${application.proposedPrice}. Terms negotiation started.`,
        lastMessageAt: new Date(),
        lastMessageSenderId: req.user._id,
      });
    }

    // 5. Initialize active negotiated terms
    let terms = await NegotiatedTerms.findOne({
      conversationId: conversation._id,
      status: { $in: ['proposed', 'mutually_accepted'] },
    });

    if (!terms) {
      terms = await NegotiatedTerms.create({
        conversationId: conversation._id,
        taskId: task._id,
        proposedById: application.providerId,
        price: application.proposedPrice,
        currency: 'INR',
        durationDays: application.proposedDurationDays,
        notes: `Initial terms from proposal: ${application.pitch}`,
        version: 1,
        requesterAccepted: false,
        providerAccepted: true, // Auto-agree from provider's application bid
        providerAcceptedAt: new Date(),
        status: 'proposed',
      });
    }

    // 6. Notify selected provider
    await createNotification({
      recipientId: application.providerId,
      senderId: req.user._id,
      type: 'application_accepted',
      title: 'Proposal Accepted!',
      message: `Congratulations! Your proposal for "${task.title}" was accepted. A private conversation has been created.`,
      linkUrl: `/conversations/${conversation._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Provider accepted successfully and private room created',
      data: {
        application,
        task,
        conversationId: conversation._id,
        termsId: terms._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyToTask,
  getTaskApplications,
  getMyApplications,
  shortlistApplication,
  rejectApplication,
  acceptApplication,
};

