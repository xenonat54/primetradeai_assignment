const express = require('express');
const { getAllUsers, deleteUser } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

router.get('/users', getAllUsers);

router.delete('/users/:id', deleteUser);

module.exports = router;
