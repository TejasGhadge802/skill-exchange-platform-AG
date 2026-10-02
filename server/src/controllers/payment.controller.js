const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const NegotiatedTerms = require('../models/NegotiatedTerms');
const User = require('../models/User');
const { createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature } = require('../services/paymentService');
const { createNotification } = require('../services/notificationService');
const config = require('../config/env');

// Create Razorpay Order for Task Escrow
const createTaskPaymentOrder = async (req, res, next) => {
  try {
    const { taskId, termsId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.requesterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only task requester can initiate payment' });
    }

    const terms = await NegotiatedTerms.findById(termsId);
    if (!terms) {
      return res.status(404).json({ success: false, message: 'Negotiated terms not found' });
    }

    if (terms.status !== 'mutually_accepted') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be initiated on mutually agreed terms',
      });
    }

    const order = await createRazorpayOrder({
      amount: terms.price,
      currency: 'INR',
      receipt: `task_${task._id}_${Date.now()}`,
    });

    const payment = await Payment.create({
      taskId: task._id,
      termsId: terms._id,
      payerId: req.user._id,
      payeeId: task.assignedProviderId,
      razorpayOrderId: order.id,
      amount: terms.price,
      currency: 'INR',
      status: 'created',
      purpose: 'task_escrow',
    });

    return res.status(200).json({
      success: true,
      message: 'Razorpay order created for task escrow',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.razorpay.keyId || 'rzp_test_mock_key',
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create Razorpay Order for Class Enrollment
const createClassPaymentOrder = async (req, res, next) => {
  try {
    const { classId } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classDoc.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Class is not approved for enrollment' });
    }

    if (new Date(classDoc.scheduleDate).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'This workshop has already concluded' });
    }

    if (!classDoc.price || classDoc.price <= 0) {
      return res.status(400).json({ success: false, message: 'This class is free. Use the free enrollment route instead.' });
    }

    if (classDoc.currentEnrolled >= classDoc.maxCapacity) {
      return res.status(400).json({ success: false, message: 'Class is already at full capacity' });
    }

    const order = await createRazorpayOrder({
      amount: classDoc.price * 100, // convert to paise
      currency: 'INR',
      receipt: `cls_${classDoc._id}_${Date.now()}`,
    });

    const payment = await Payment.create({
      classId: classDoc._id,
      payerId: req.user._id,
      payeeId: classDoc.instructorId,
      razorpayOrderId: order.id,
      amount: classDoc.price,
      currency: 'INR',
      status: 'created',
      purpose: 'class_fee',
    });

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: config.razorpay.keyId || process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
        paymentId: payment._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Verify Payment Signature & Complete Task / Enrollment State Transition
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const isValid = verifyRazorpaySignature({
      orderId: razorpayOrderId,
      paymentId: razorpayPaymentId,
      signature: razorpaySignature,
    });

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Razorpay payment signature',
      });
    }

    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';
    await payment.save();

    // If it's a task escrow payment:
    if (payment.taskId) {
      const task = await Task.findById(payment.taskId);
      if (task) {
        task.status = 'in_progress';
        await task.save();

        // Increment provider total earnings tracker
        await User.findByIdAndUpdate(payment.payeeId, {
          $inc: { earningsTotal: payment.amount },
        });

        // Notify provider that payment is funded and work can begin
        await createNotification({
          recipientId: payment.payeeId,
          senderId: payment.payerId,
          type: 'payment_completed',
          title: 'Escrow Payment Secured!',
          message: `Requester deposited ₹${payment.amount} in escrow for "${task.title}". The task is now officially In Progress!`,
          linkUrl: `/tasks/${task._id}`,
        });

        // Notify both provider and requester to leave reviews
        await createNotification({
          recipientId: payment.payeeId,
          senderId: payment.payerId,
          type: 'review_requested',
          title: 'Leave Your Review',
          message: `Payment has been confirmed for task "${task.title}". Please leave your review!`,
          linkUrl: `/tasks/${task._id}`,
        });

        await createNotification({
          recipientId: payment.payerId,
          senderId: payment.payeeId,
          type: 'review_requested',
          title: 'Leave Your Review',
          message: `Payment has been confirmed for task "${task.title}". Please leave your review!`,
          linkUrl: `/tasks/${task._id}`,
        });
      }
    }

    // If it's a class enrollment payment:
    if (payment.classId) {
      const classDoc = await Class.findById(payment.classId);
      if (classDoc) {
        await Enrollment.findOneAndUpdate(
          { classId: classDoc._id, studentId: payment.payerId },
          { status: 'enrolled', paymentId: payment._id },
          { upsert: true, new: true }
        );

        await Class.findByIdAndUpdate(classDoc._id, {
          $inc: { currentEnrolled: 1 },
        });

        await createNotification({
          recipientId: classDoc.instructorId,
          senderId: payment.payerId,
          type: 'class_enrolled',
          title: 'New Student Enrollment',
          message: `A new student enrolled in "${classDoc.title}" (Paid ₹${payment.amount}).`,
          linkUrl: `/classes/${classDoc._id}`,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and captured successfully',
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

// Razorpay Webhook Handler
const handleRazorpayWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyStr = JSON.stringify(req.body);

    const isValid = verifyWebhookSignature({ body: bodyStr, signature });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' });
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload.payment.entity;
      const orderId = paymentEntity.order_id;

      const payment = await Payment.findOne({ razorpayOrderId: orderId });
      if (payment && payment.status !== 'captured') {
        payment.status = 'captured';
        payment.razorpayPaymentId = paymentEntity.id;
        await payment.save();

        if (payment.taskId) {
          await Task.findByIdAndUpdate(payment.taskId, { status: 'in_progress' });
        }
      }
    }

    return res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('[Razorpay Webhook Error]:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createTaskPaymentOrder,
  createClassPaymentOrder,
  verifyPayment,
  handleRazorpayWebhook,
};

