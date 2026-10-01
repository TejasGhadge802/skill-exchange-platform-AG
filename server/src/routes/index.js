const express = require('express');

const healthRoutes = require('./health.routes');
const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const taskRoutes = require('./task.routes');
const applicationRoutes = require('./application.routes');
const conversationRoutes = require('./conversation.routes');
const termsRoutes = require('./terms.routes');
const paymentRoutes = require('./payment.routes');
const classRoutes = require('./class.routes');
const reviewRoutes = require('./review.routes');
const notificationRoutes = require('./notification.routes');
const reportRoutes = require('./report.routes');
const adminRoutes = require('./admin.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/applications', applicationRoutes);
router.use('/conversations', conversationRoutes);
router.use('/terms', termsRoutes);
router.use('/payments', paymentRoutes);
router.use('/classes', classRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

module.exports = router;

