const express = require('express');
const {
  createClassDraft,
  updateClass,
  submitClassForApproval,
  getPublicClasses,
  getClassById,
  enrollInFreeClass,
  getMyHostedClasses,
  getMyEnrolledClasses,
  getUpcomingClassReminders,
  enrollAfterPayment,
} = require('../controllers/class.controller');
const { createClassPaymentOrder } = require('../controllers/payment.controller');
const { verifyFirebaseToken, optionalAuth } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

const router = express.Router();

router.get('/', getPublicClasses);
router.get('/my/hosted', verifyFirebaseToken, requireRole(['instructor', 'admin']), getMyHostedClasses);
router.get('/my/enrolled', verifyFirebaseToken, getMyEnrolledClasses);
router.get('/reminders', verifyFirebaseToken, getUpcomingClassReminders);
router.get('/:id', optionalAuth, getClassById);
router.post('/draft', verifyFirebaseToken, requireRole(['instructor', 'admin']), createClassDraft);
router.put('/:id', verifyFirebaseToken, requireRole(['instructor', 'admin']), updateClass);
router.post('/:id/submit', verifyFirebaseToken, requireRole(['instructor', 'admin']), submitClassForApproval);
router.post('/:id/enroll-free', verifyFirebaseToken, enrollInFreeClass);
router.post('/:id/pay', verifyFirebaseToken, createClassPaymentOrder);
router.post('/:id/enroll-paid', verifyFirebaseToken, enrollAfterPayment);

module.exports = router;

