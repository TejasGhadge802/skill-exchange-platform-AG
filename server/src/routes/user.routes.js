const express = require('express');
const { getUserProfileById, getDashboardStats, updateMyProfile } = require('../controllers/user.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard/stats', verifyFirebaseToken, getDashboardStats);
router.put('/profile', verifyFirebaseToken, updateMyProfile);
router.get('/:id', getUserProfileById);

module.exports = router;

