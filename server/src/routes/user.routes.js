const express = require('express');
const { getUserProfileById, getDashboardStats } = require('../controllers/user.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/dashboard/stats', verifyFirebaseToken, getDashboardStats);
router.get('/:id', getUserProfileById);

module.exports = router;

