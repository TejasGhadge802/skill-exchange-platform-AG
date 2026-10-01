const express = require('express');
const {
  getMyConversations,
  getConversationById,
  getConversationMessages,
} = require('../controllers/conversation.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyFirebaseToken);
router.get('/', getMyConversations);
router.get('/:id', getConversationById);
router.get('/:id/messages', getConversationMessages);

module.exports = router;

