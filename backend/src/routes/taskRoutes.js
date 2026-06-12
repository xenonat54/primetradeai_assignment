const express = require('express');
const { body } = require('express-validator');
const {
  getTasks, getTaskById, createTask, updateTask, deleteTask, getAllTasksAdmin,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/errorHandler');

const router = express.Router();

router.use(protect);

const taskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('status').optional().isIn(['pending', 'in-progress', 'completed']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Invalid priority'),
];

router.route('/').get(getTasks).post(taskValidation, validate, createTask);

router.get('/admin/all', authorize('admin'), getAllTasksAdmin);

router
  .route('/:id')
  .get(getTaskById)
  .put(taskValidation, validate, updateTask)
  .delete(deleteTask);

module.exports = router;
