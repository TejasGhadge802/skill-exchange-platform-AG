const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// Get all conversations for current user
const getMyConversations = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ requesterId: userId }, { providerId: userId }],
    })
      .populate('taskId', 'title category status budgetMax')
      .populate('requesterId', 'displayName photoURL email ratingAverage')
      .populate('providerId', 'displayName photoURL email ratingAverage')
      .sort({ lastMessageAt: -1 });

    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};

// Get single conversation details by ID
const getConversationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id)
      .populate('taskId')
      .populate('requesterId', 'displayName photoURL email ratingAverage ratingCount bio')
      .populate('providerId', 'displayName photoURL email ratingAverage ratingCount bio');

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      conversation.requesterId._id.toString() === userId ||
      conversation.providerId._id.toString() === userId ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Access denied to this conversation' });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};

// Get message history for conversation
const getConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userId = req.user._id.toString();
    const isParticipant =
      conversation.requesterId.toString() === userId ||
      conversation.providerId.toString() === userId ||
      req.user.role === 'admin';

    if (!isParticipant) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'displayName photoURL')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyConversations,
  getConversationById,
  getConversationMessages,
};

