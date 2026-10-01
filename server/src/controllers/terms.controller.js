const NegotiatedTerms = require('../models/NegotiatedTerms');
const Conversation = require('../models/Conversation');
const Task = require('../models/Task');
const { createNotification } = require('../services/notificationService');

// Get active terms for a conversation
const getActiveTerms = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const conversation = await Conversation.findById(conversationId);

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

    const terms = await NegotiatedTerms.findOne({
      conversationId,
      status: { $in: ['proposed', 'mutually_accepted'] },
    })
      .populate('proposedById', 'displayName photoURL')
      .sort({ version: -1 });

    return res.status(200).json({
      success: true,
      data: terms,
    });
  } catch (error) {
    next(error);
  }
};

// Propose new terms or counter-offer
const proposeTerms = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { price, durationDays, startDate, endDate, notes } = req.body;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    const userId = req.user._id.toString();
    const isRequester = conversation.requesterId.toString() === userId;
    const isProvider = conversation.providerId.toString() === userId;

    if (!isRequester && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    // Supersede any existing terms
    const latestTerms = await NegotiatedTerms.findOne({
      conversationId,
      status: { $in: ['proposed', 'mutually_accepted'] },
    }).sort({ version: -1 });

    const newVersion = latestTerms ? latestTerms.version + 1 : 1;

    if (latestTerms) {
      latestTerms.status = 'superseded';
      await latestTerms.save();
    }

    const newTerms = await NegotiatedTerms.create({
      conversationId,
      taskId: conversation.taskId,
      proposedById: req.user._id,
      price: Number(price),
      currency: 'INR',
      durationDays: Number(durationDays),
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      notes: notes || '',
      version: newVersion,
      requesterAccepted: isRequester,
      requesterAcceptedAt: isRequester ? new Date() : null,
      providerAccepted: isProvider,
      providerAcceptedAt: isProvider ? new Date() : null,
      status: 'proposed',
    });

    const otherPartyId = isRequester ? conversation.providerId : conversation.requesterId;

    await createNotification({
      recipientId: otherPartyId,
      senderId: req.user._id,
      type: 'terms_proposed',
      title: 'New Terms Proposed',
      message: `${req.user.displayName} proposed updated terms: ₹${price} for ${durationDays} days.`,
      linkUrl: `/conversations/${conversationId}`,
    });

    return res.status(201).json({
      success: true,
      message: 'New terms proposed successfully',
      data: newTerms,
    });
  } catch (error) {
    next(error);
  }
};

// Accept the current proposed terms
const acceptTerms = async (req, res, next) => {
  try {
    const { id } = req.params;
    const terms = await NegotiatedTerms.findById(id);

    if (!terms) {
      return res.status(404).json({ success: false, message: 'Terms not found' });
    }

    const conversation = await Conversation.findById(terms.conversationId);
    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Associated conversation not found' });
    }

    const userId = req.user._id.toString();
    const isRequester = conversation.requesterId.toString() === userId;
    const isProvider = conversation.providerId.toString() === userId;

    if (!isRequester && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (isRequester) {
      terms.requesterAccepted = true;
      terms.requesterAcceptedAt = new Date();
    }

    if (isProvider) {
      terms.providerAccepted = true;
      terms.providerAcceptedAt = new Date();
    }

    // Check if both parties agreed
    if (terms.requesterAccepted && terms.providerAccepted) {
      terms.status = 'mutually_accepted';

      // Advance task status to payment_pending
      await Task.findByIdAndUpdate(terms.taskId, {
        status: 'payment_pending',
      });

      // Notify both parties
      await createNotification({
        recipientId: conversation.requesterId,
        senderId: req.user._id,
        type: 'terms_accepted',
        title: 'Terms Mutually Accepted!',
        message: 'Both parties have agreed to the terms. Please proceed to Escrow Payment.',
        linkUrl: `/conversations/${conversation._id}`,
      });

      await createNotification({
        recipientId: conversation.providerId,
        senderId: req.user._id,
        type: 'terms_accepted',
        title: 'Terms Mutually Accepted!',
        message: 'Both parties agreed. Awaiting requester escrow payment.',
        linkUrl: `/conversations/${conversation._id}`,
      });
    }

    await terms.save();

    return res.status(200).json({
      success: true,
      message: terms.status === 'mutually_accepted' ? 'Terms mutually agreed! Ready for payment.' : 'Terms acceptance recorded.',
      data: terms,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getActiveTerms,
  proposeTerms,
  acceptTerms,
};

