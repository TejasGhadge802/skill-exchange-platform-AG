const Class = require('../models/Class');
const Enrollment = require('../models/Enrollment');
const { createNotification } = require('../services/notificationService');

// Create class draft
const createClassDraft = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      price,
      maxCapacity,
      scheduleDate,
      durationMinutes,
      meetingUrl,
    } = req.body;

    const classDoc = await Class.create({
      instructorId: req.user._id,
      title,
      description,
      category,
      price: price ? Number(price) : 0,
      currency: 'INR',
      maxCapacity: Number(maxCapacity),
      scheduleDate: new Date(scheduleDate),
      durationMinutes: Number(durationMinutes),
      meetingUrl: meetingUrl || '',
      status: 'draft',
    });

    return res.status(201).json({
      success: true,
      message: 'Class draft created successfully',
      data: classDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Edit class
const updateClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classDoc.instructorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (!['draft', 'rejected'].includes(classDoc.status) && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: `Classes in '${classDoc.status}' status cannot be modified.`,
      });
    }

    const {
      title,
      description,
      category,
      price,
      maxCapacity,
      scheduleDate,
      durationMinutes,
      meetingUrl,
    } = req.body;

    if (title) classDoc.title = title;
    if (description) classDoc.description = description;
    if (category) classDoc.category = category;
    if (price !== undefined) classDoc.price = Number(price);
    if (maxCapacity !== undefined) classDoc.maxCapacity = Number(maxCapacity);
    if (scheduleDate) classDoc.scheduleDate = new Date(scheduleDate);
    if (durationMinutes !== undefined) classDoc.durationMinutes = Number(durationMinutes);
    if (meetingUrl !== undefined) classDoc.meetingUrl = meetingUrl;

    await classDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Class updated successfully',
      data: classDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Submit class for moderation
const submitClassForApproval = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classDoc.instructorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    classDoc.status = 'pending_approval';
    classDoc.moderationNotes = '';
    await classDoc.save();

    return res.status(200).json({
      success: true,
      message: 'Class submitted for moderation',
      data: classDoc,
    });
  } catch (error) {
    next(error);
  }
};

// Get marketplace classes
const getPublicClasses = async (req, res, next) => {
  try {
    const {
      keyword,
      category,
      isFree,
      page = 1,
      limit = 12,
    } = req.query;

    const query = { status: 'approved', scheduleDate: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } };

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = { $regex: `^${category}$`, $options: 'i' };
    }

    if (isFree === 'true') {
      query.price = 0;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [classes, total] = await Promise.all([
      Class.find(query)
        .populate('instructorId', 'displayName photoURL ratingAverage ratingCount bio')
        .sort({ scheduleDate: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Class.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      data: classes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get single class details
const getClassById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id).populate(
      'instructorId',
      'displayName photoURL email bio ratingAverage ratingCount'
    );

    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    let isEnrolled = false;
    if (req.user) {
      const enrollment = await Enrollment.findOne({
        classId: classDoc._id,
        studentId: req.user._id,
        status: 'enrolled',
      });
      isEnrolled = !!enrollment;
    }

    return res.status(200).json({
      success: true,
      data: {
        ...classDoc.toObject(),
        isEnrolled,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Enroll in free class
const enrollInFreeClass = async (req, res, next) => {
  try {
    const { id } = req.params;
    const classDoc = await Class.findById(id);

    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (classDoc.price > 0) {
      return res.status(400).json({
        success: false,
        message: 'This is a paid class. Please proceed via Razorpay payment.',
      });
    }

    if (classDoc.currentEnrolled >= classDoc.maxCapacity) {
      return res.status(400).json({ success: false, message: 'Class is full' });
    }

    const existing = await Enrollment.findOne({ classId: id, studentId: req.user._id });
    if (existing && existing.status === 'enrolled') {
      return res.status(400).json({ success: false, message: 'Already enrolled in this class' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { classId: id, studentId: req.user._id },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );

    await Class.findByIdAndUpdate(id, { $inc: { currentEnrolled: 1 } });

    await createNotification({
      recipientId: classDoc.instructorId,
      senderId: req.user._id,
      type: 'class_enrolled',
      title: 'Free Class Enrollment',
      message: `${req.user.displayName} enrolled in "${classDoc.title}".`,
      linkUrl: `/classes/${classDoc._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Enrolled successfully in free class!',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

// Instructor: Get classes hosted by me
const getMyHostedClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ instructorId: req.user._id }).sort({ scheduleDate: -1 });

    return res.status(200).json({
      success: true,
      data: classes,
    });
  } catch (error) {
    next(error);
  }
};

// Student: Get my enrolled classes
const getMyEnrolledClasses = async (req, res, next) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id, status: 'enrolled' })
      .populate({
        path: 'classId',
        populate: { path: 'instructorId', select: 'displayName photoURL email' },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: enrollments.map(e => e.classId).filter(Boolean),
    });
  } catch (error) {
    next(error);
  }
};

// Get upcoming class reminders (classes starting within the next 2 hours)
const getUpcomingClassReminders = async (req, res, next) => {
  try {
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const enrollments = await Enrollment.find({
      studentId: req.user._id,
      status: 'enrolled',
    }).populate('classId');

    const upcoming = enrollments.filter((e) => {
      if (!e.classId) return false;
      const scheduleDate = new Date(e.classId.scheduleDate);
      return scheduleDate >= now && scheduleDate <= twoHoursFromNow;
    });

    return res.status(200).json({
      success: true,
      data: upcoming,
    });
  } catch (error) {
    next(error);
  }
};

// Enroll after paid class payment confirmation
const enrollAfterPayment = async (req, res, next) => {
  try {
    const { classId } = req.body;

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { classId: classDoc._id, studentId: req.user._id },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );

    await Class.findByIdAndUpdate(classDoc._id, { $inc: { currentEnrolled: 1 } });

    await createNotification({
      recipientId: classDoc.instructorId,
      senderId: req.user._id,
      type: 'class_enrolled',
      title: 'New Paid Enrollment',
      message: `${req.user.displayName} has enrolled in "${classDoc.title}" after completing payment.`,
      linkUrl: `/classes/${classDoc._id}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Enrolled successfully after payment!',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
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
};

