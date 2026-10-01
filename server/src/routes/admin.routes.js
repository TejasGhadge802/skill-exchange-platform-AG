const express = require('express');
const {
  getPendingTasks,
  moderateTask,
  getPendingClasses,
  moderateClass,
  getReports,
  resolveReport,
  getAuditLogs,
  getAllUsers,
  updateUserRole,
} = require('../controllers/admin.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');
const { requireRole } = require('../middlewares/role');

const router = express.Router();

router.use(verifyFirebaseToken);
router.use(requireRole(['admin']));

router.get('/moderation/tasks', getPendingTasks);
router.patch('/moderation/tasks/:id', moderateTask);

router.get('/moderation/classes', getPendingClasses);
router.patch('/moderation/classes/:id', moderateClass);

router.get('/reports', getReports);
router.patch('/reports/:id/resolve', resolveReport);

router.get('/audit-logs', getAuditLogs);
router.get('/users', getAllUsers);
router.patch('/users/:userId', updateUserRole);

module.exports = router;

