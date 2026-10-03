const Task = require('../models/Task');
const Application = require('../models/Application');
const { createNotification } = require('../services/notificationService');

// Create a new task in draft state
const createTaskDraft = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      requiredSkills,
      workMode,
      location,
      budgetMin,
      budgetMax,
      deadline,
    } = req.body;

    const task = await Task.create({
      requesterId: req.user._id,
      title,
      description,
      category,
      requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : (requiredSkills ? requiredSkills.split(',').map(s => s.trim()) : []),
      workMode: workMode || 'remote',
      location: location || '',
      budgetMin: budgetMin ? Number(budgetMin) : 0,
      budgetMax: Number(budgetMax),
      deadline: deadline ? new Date(deadline) : null,
      status: 'draft',
    });

    return res.status(201).json({
      success: true,
      message: 'Task draft created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Edit draft or rejected task
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this task' });
    }

    if (!['draft', 'rejected'].includes(task.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Tasks in '${task.status}' status cannot be edited. Only drafts or rejected tasks can be modified.`,
      });
    }

    const {
      title,
      description,
      category,
      requiredSkills,
      workMode,
      location,
      budgetMin,
      budgetMax,
      deadline,
    } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (category) task.category = category;
    if (requiredSkills) {
      task.requiredSkills = Array.isArray(requiredSkills)
        ? requiredSkills
        : requiredSkills.split(',').map(s => s.trim());
    }
    if (workMode) task.workMode = workMode;
    if (location !== undefined) task.location = location;
    if (budgetMin !== undefined) task.budgetMin = Number(budgetMin);
    if (budgetMax !== undefined) task.budgetMax = Number(budgetMax);
    if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Delete draft or rejected task
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this task' });
    }

    if (!['draft', 'rejected'].includes(task.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Tasks in '${task.status}' status cannot be deleted.`,
      });
    }

    await Task.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Submit task for moderation
const submitTaskForApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['draft', 'rejected'].includes(task.status)) {
      return res.status(400).json({
        success: false,
        message: `Task is already in '${task.status}' status`,
      });
    }

    task.status = 'pending_approval';
    task.moderationNotes = '';
    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task submitted for moderation approval',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Get published marketplace tasks
const getMarketplaceTasks = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      skill,
      workMode,
      location,
      minBudget,
      maxBudget,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = { status: 'approved' };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { requiredSkills: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (skill) {
      query.requiredSkills = { $in: [new RegExp(skill, 'i')] };
    }

    if (workMode) {
      query.workMode = workMode;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (minBudget || maxBudget) {
      query.budgetMax = {};
      if (minBudget) query.budgetMax.$gte = Number(minBudget);
      if (maxBudget) query.budgetMax.$lte = Number(maxBudget);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('requesterId', 'displayName photoURL ratingAverage ratingCount')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get task details by ID
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id)
      .populate('requesterId', 'displayName email photoURL bio ratingAverage ratingCount')
      .populate('assignedProviderId', 'displayName email photoURL bio ratingAverage ratingCount');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Get current user's posted tasks
const getMyTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ requesterId: req.user._id })
      .populate('assignedProviderId', 'displayName photoURL')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

// Provider requests completion
const requestTaskCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.assignedProviderId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only assigned provider can request completion' });
    }

    if (task.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Task must be in_progress to request completion' });
    }

    task.completionRequestedByProvider = true;
    await task.save();

    await createNotification({
      recipientId: task.requesterId,
      senderId: req.user._id,
      type: 'completion_requested',
      title: 'Task Completion Requested',
      message: `${req.user.displayName} has marked task "${task.title}" as completed and requested your confirmation.`,
      linkUrl: `/tasks/${task._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Completion request submitted to requester',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Requester confirms completion
const confirmTaskCompletion = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only task requester can confirm completion' });
    }

    if (task.status !== 'in_progress') {
      return res.status(400).json({ success: false, message: 'Task must be in_progress to complete' });
    }

    task.status = 'completed';
    task.completionConfirmedByRequester = true;
    await task.save();

    if (task.assignedProviderId) {
      await createNotification({
        recipientId: task.assignedProviderId,
        senderId: req.user._id,
        type: 'task_completed',
        title: 'Task Completed & Confirmed!',
        message: `Requester confirmed completion of task "${task.title}". You can now submit a review!`,
        linkUrl: `/tasks/${task._id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task successfully marked as completed',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

// Get tasks where current user is the assigned provider
const getProviderTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({
      assignedProviderId: req.user._id,
      status: { $in: ['in_progress', 'completed'] },
    })
      .populate('requesterId', 'displayName photoURL')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTaskDraft,
  updateTask,
  deleteTask,
  submitTaskForApproval,
  getMarketplaceTasks,
  getTaskById,
  getMyTasks,
  getProviderTasks,
  requestTaskCompletion,
  confirmTaskCompletion,
};

