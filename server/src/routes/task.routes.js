const express = require('express');
const {
  createTaskDraft,
  updateTask,
  deleteTask,
  submitTaskForApproval,
  getMarketplaceTasks,
  getTaskById,
  getMyTasks,
  getProviderTasks,
  requestTaskCompletion,
  confirmTaskCompletion,
} = require('../controllers/task.controller');
const { verifyFirebaseToken } = require('../middlewares/auth');

const router = express.Router();

router.get('/', getMarketplaceTasks);
router.get('/my/posted', verifyFirebaseToken, getMyTasks);
router.get('/my/provider', verifyFirebaseToken, getProviderTasks);
router.get('/:id', getTaskById);
router.post('/draft', verifyFirebaseToken, createTaskDraft);
router.put('/:id', verifyFirebaseToken, updateTask);
router.delete('/:id', verifyFirebaseToken, deleteTask);
router.post('/:id/submit', verifyFirebaseToken, submitTaskForApproval);
router.post('/:id/request-completion', verifyFirebaseToken, requestTaskCompletion);
router.post('/:id/confirm-completion', verifyFirebaseToken, confirmTaskCompletion);

module.exports = router;

