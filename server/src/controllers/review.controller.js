const Review = require('../models/Review');
const Task = require('../models/Task');
const { updateUserRatings } = require('../services/statsService');
const { createNotification } = require('../services/notificationService');

const createReview = async (req, res, next) => {
  try {
    const { taskId, rating, comment } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be submitted for completed tasks',
      });
    }

    const userId = req.user._id.toString();
    const isRequester = task.requesterId.toString() === userId;
    const isProvider = task.assignedProviderId?.toString() === userId;

    if (!isRequester && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Only verified participants of this task can leave a review',
      });
    }

    const revieweeId = isRequester ? task.assignedProviderId : task.requesterId;
    const role = isRequester ? 'requester_to_provider' : 'provider_to_requester';

    // Check for existing review
    const existing = await Review.findOne({
      taskId,
      reviewerId: req.user._id,
      revieweeId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a review for this task',
      });
    }

    const review = await Review.create({
      taskId,
      reviewerId: req.user._id,
      revieweeId,
      role,
      rating: Number(rating),
      comment,
    });

    // Recalculate reviewee rating metrics
    await updateUserRatings(revieweeId);

    // Notify reviewee
    await createNotification({
      recipientId: revieweeId,
      senderId: req.user._id,
      type: 'review_received',
      title: 'New Review Received',
      message: `${req.user.displayName} gave you a ${rating}★ review for "${task.title}".`,
      linkUrl: `/tasks/${task._id}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewsForUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await Review.find({ revieweeId: userId })
      .populate('reviewerId', 'displayName photoURL')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getReviewsForUser,
};

