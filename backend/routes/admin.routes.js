const express = require('express');
const router = express.Router();
const {
  getStats, getUsers, toggleBanUser, verifyUser, makeAdmin,
  getRides, adminCancelRide,
  getReportedReviews, toggleReviewVisibility,
  getBookings
} = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect, admin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.put('/users/:id/ban', toggleBanUser);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/make-admin', makeAdmin);
router.get('/rides', getRides);
router.put('/rides/:id/cancel', adminCancelRide);
router.get('/reviews/reported', getReportedReviews);
router.put('/reviews/:id/toggle-visibility', toggleReviewVisibility);
router.get('/bookings', getBookings);

module.exports = router;
