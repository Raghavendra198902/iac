const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware
const registerValidation = [
  body('username').trim().isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_-]+$/),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/),
  body('firstName').optional().trim().isLength({ max: 100 }),
  body('lastName').optional().trim().isLength({ max: 100 }),
];

const loginValidation = [
  body('username').trim().notEmpty(),
  body('password').notEmpty(),
];

const refreshTokenValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

// Routes
router.post('/register', registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', refreshTokenValidation, authController.refreshAccessToken);
router.post('/2fa/setup', authenticate, authController.setupTwoFactor);
router.post('/2fa/enable', authenticate, authController.enableTwoFactor);

module.exports = router;
