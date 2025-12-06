const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authenticate, checkPermission } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all roles
router.get('/', checkPermission('roles.view'), roleController.getAllRoles);

// Get all permissions
router.get('/permissions', checkPermission('roles.view'), roleController.getAllPermissions);

// Create role (requires roles.create permission)
router.post('/', checkPermission('roles.create'), roleController.createRole);

// Update role (requires roles.update permission)
router.put('/:id', checkPermission('roles.update'), roleController.updateRole);

// Delete role (requires roles.delete permission)
router.delete('/:id', checkPermission('roles.delete'), roleController.deleteRole);

module.exports = router;
