const express = require('express');
const { getActiveTerms, proposeTerms, acceptTerms } = require('../controllers/terms.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.use(verifyFirebaseToken);
router.get('/conversation/:conversationId', getActiveTerms);
router.post('/conversation/:conversationId/propose', proposeTerms);
router.post('/:id/accept', acceptTerms);

module.exports = router;

