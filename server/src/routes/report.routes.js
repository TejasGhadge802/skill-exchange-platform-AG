const express = require('express');
const { submitReport } = require('../controllers/report.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.post('/', verifyFirebaseToken, submitReport);

module.exports = router;

