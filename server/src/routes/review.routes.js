const express = require('express');
const { createReview, getReviewsForUser } = require('../controllers/review.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/user/:userId', getReviewsForUser);
router.post('/', verifyFirebaseToken, createReview);

module.exports = router;

