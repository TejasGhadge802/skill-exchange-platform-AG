const Razorpay = require('razorpay');
const config = require('./env');

let razorpayInstance = null;

if (config.razorpay.keyId && config.razorpay.keySecret) {
  try {
    razorpayInstance = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
    console.log('[Razorpay] Initialized successfully with test/live keys');
  } catch (error) {
    console.warn('[Razorpay Warning] Initialization failed:', error.message);
  }
} else {
  console.warn('[Razorpay Info] Razorpay credentials not configured in environment. Test payment mock mode enabled.');
}

module.exports = razorpayInstance;

