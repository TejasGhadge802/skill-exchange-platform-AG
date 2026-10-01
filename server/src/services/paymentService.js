const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const config = require('../config/env');

const createRazorpayOrder = async ({ amount, currency = 'INR', receipt }) => {
  const amountInPaise = Math.round(amount * 100);

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt: receipt || `rcpt_${Date.now()}`,
      });
      return order;
    } catch (error) {
      console.error('[Razorpay Order Creation Error]:', error);
      throw error;
    }
  } else {
    // Mock Razorpay order for development/testing when keys are not yet provided
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      entity: 'order',
      amount: amountInPaise,
      amount_paid: 0,
      amount_due: amountInPaise,
      currency,
      receipt,
      status: 'created',
      mock: true,
    };
  }
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  if (!signature) return false;

  // In mock mode
  if (orderId && orderId.startsWith('order_mock_')) {
    return true;
  }

  if (!config.razorpay.keySecret) {
    return true; // Dev mode fallback
  }

  const generatedSignature = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

const verifyWebhookSignature = ({ body, signature }) => {
  if (!config.razorpay.webhookSecret) return true;

  const expectedSignature = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
};

