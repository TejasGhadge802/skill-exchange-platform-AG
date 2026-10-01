const express = require('express');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyFirebaseToken);
router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.patch('/mark-all-read', markAllAsRead);

module.exports = router;

