const express = require('express');
const {
  applyToTask,
  getTaskApplications,
  getMyApplications,
  shortlistApplication,
  rejectApplication,
  acceptApplication,
} = require('../controllers/application.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/task/:taskId', verifyFirebaseToken, applyToTask);
router.get('/task/:taskId', verifyFirebaseToken, getTaskApplications);
router.get('/my/submitted', verifyFirebaseToken, getMyApplications);
router.patch('/:id/shortlist', verifyFirebaseToken, shortlistApplication);
router.patch('/:id/reject', verifyFirebaseToken, rejectApplication);
router.post('/:id/accept', verifyFirebaseToken, acceptApplication);

module.exports = router;

