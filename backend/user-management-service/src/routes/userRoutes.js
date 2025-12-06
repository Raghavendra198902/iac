const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, checkPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all users (requires users.view permission)
router.get('/', checkPermission('users.view'), userController.getAllUsers);

// Get user by ID
router.get('/:id', checkPermission('users.view'), userController.getUserById);

// Create user (requires users.create permission)
router.post('/', checkPermission('users.create'), userController.createUser);

// Update user (requires users.update permission)
router.put('/:id', checkPermission('users.update'), userController.updateUser);

// Delete user (requires users.delete permission)
router.delete('/:id', checkPermission('users.delete'), userController.deleteUser);

// Get user activities
router.get('/:id/activities', checkPermission('audit.view'), userController.getUserActivities);

module.exports = router;
