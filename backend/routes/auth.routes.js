const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout,
  uploadPhoto,
  toggleNearbyAlerts,
  saveLocation,
  saveFavoriteVenues
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimiter.middleware');
const {
  registerValidation,
  loginValidation,
  validate
} = require('../middleware/validation.middleware');

// Public routes
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/upload-photo', protect, upload.single('photo'), uploadPhoto);
router.post('/logout', protect, logout);
router.put('/nearby-alerts', protect, toggleNearbyAlerts);
router.put('/location', protect, saveLocation);
router.put('/favorite-venues', protect, saveFavoriteVenues);

module.exports = router;
