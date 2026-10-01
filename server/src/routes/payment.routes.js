const express = require('express');
const {
  createTaskPaymentOrder,
  createClassPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
} = require('../controllers/payment.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/order/task', verifyFirebaseToken, createTaskPaymentOrder);
router.post('/order/class', verifyFirebaseToken, createClassPaymentOrder);
router.post('/verify', verifyFirebaseToken, verifyPayment);
router.post('/webhook', express.raw({ type: 'application/json' }), handleRazorpayWebhook);

module.exports = router;

