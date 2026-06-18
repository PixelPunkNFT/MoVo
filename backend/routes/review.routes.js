const express = require('express');
const router = express.Router();
const {
  addReview,
  getUserReviews,
  respondToReview,
  reportReview
} = require('../controllers/review.controller');
const { protect } = require('../middleware/auth.middleware');
const { reviewValidation, validate } = require('../middleware/validation.middleware');

// Public routes
router.get('/user/:userId', getUserReviews);

// Protected routes
router.post('/:bookingId', protect, reviewValidation, validate, addReview);
router.post('/:id/response', protect, respondToReview);
router.post('/:id/report', protect, reportReview);

module.exports = router;
