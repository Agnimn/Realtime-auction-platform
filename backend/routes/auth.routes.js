/**
 * Auth Routes
 * POST /api/auth/register
 * POST /api/auth/login
 * GET  /api/auth/profile
 * PUT  /api/auth/profile
 * PUT  /api/auth/change-password
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getProfile, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadProfileImage } = require('../middleware/upload.middleware');

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', uploadProfileImage, registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, uploadProfileImage, updateProfile);
router.put('/change-password', protect, changePassword);

module.exports = router;
