const { auth } = require('../config/firebase');
const User = require('../models/User');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const setupChatSocket = (io) => {
  // Socket.IO Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication token required for WebSocket'));
      }

      let decodedToken;
      if (auth) {
        try {
          decodedToken = await auth.verifyIdToken(token);
        } catch (err) {
          return next(new Error('Invalid WebSocket auth token'));
        }
      } else {
        try {
          decodedToken = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        } catch (e) {
          decodedToken = { uid: token, email: `${token}@example.com`, name: token };
        }
      }

      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      if (!user) {
        return next(new Error('User profile not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      console.error('[Socket Auth Error]:', error);
      next(new Error('Socket authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    // Join personal notification channel
    socket.join(`user_${user._id.toString()}`);

    // Join Conversation Room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error_message', 'Conversation not found');
        }

        const userId = user._id.toString();
        const isAuthorized =
          conversation.requesterId.toString() === userId ||
          conversation.providerId.toString() === userId ||
          user.role === 'admin';

        if (!isAuthorized) {
          return socket.emit('error_message', 'Unauthorized to join this conversation');
        }

        socket.join(`conversation_${conversationId}`);
        socket.emit('joined_conversation', conversationId);
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    // Leave Conversation Room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Send Message
    socket.on('send_message', async ({ conversationId, text, attachments = [] }) => {
      try {
        if (!text || !text.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
          return socket.emit('error_message', 'Conversation not found');
        }

        const userId = user._id.toString();
        const isAuthorized =
          conversation.requesterId.toString() === userId ||
          conversation.providerId.toString() === userId ||
          user.role === 'admin';

        if (!isAuthorized) {
          return socket.emit('error_message', 'Unauthorized');
        }

        const message = await Message.create({
          conversationId,
          senderId: user._id,
          text: text.trim(),
          attachments,
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'senderId',
          'displayName photoURL'
        );

        // Update conversation summary
        conversation.lastMessage = text.trim();
        conversation.lastMessageAt = new Date();
        conversation.lastMessageSenderId = user._id;
        await conversation.save();

        // Broadcast to room
        io.to(`conversation_${conversationId}`).emit('new_message', populatedMessage);

        // Notify recipient if not in room
        const recipientId =
          conversation.requesterId.toString() === userId
            ? conversation.providerId
            : conversation.requesterId;

        io.to(`user_${recipientId.toString()}`).emit('conversation_updated', {
          conversationId,
          lastMessage: text.trim(),
          senderName: user.displayName,
        });
      } catch (error) {
        socket.emit('error_message', error.message);
      }
    });

    // Typing Indicators
    socket.on('typing_start', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId: user._id,
        displayName: user.displayName,
      });
    });

    socket.on('typing_stop', ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
        userId: user._id,
      });
    });

    // Terms update broadcast
    socket.on('terms_changed', ({ conversationId, terms }) => {
      socket.to(`conversation_${conversationId}`).emit('terms_updated', terms);
    });

    socket.on('disconnect', () => {
      // Clean up socket
    });
  });
};

module.exports = setupChatSocket;

