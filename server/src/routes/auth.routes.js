const express = require('express');
const { getMe, updateProfile } = require('../controllers/auth.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.use(authLimiter);
router.get('/me', verifyFirebaseToken, getMe);
router.put('/profile', verifyFirebaseToken, updateProfile);

module.exports = router;

