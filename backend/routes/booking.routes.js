const express = require('express');
const router = express.Router();
const {
  bookRide,
  getMyBookings,
  getReceivedBookings,
  confirmBooking,
  rejectBooking,
  cancelBooking,
  completeBooking
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { bookRideValidation, validate } = require('../middleware/validation.middleware');

// Tutte le routes richiedono autenticazione
router.use(protect);

router.post('/:rideId', bookRideValidation, validate, bookRide);
router.get('/my-bookings', getMyBookings);
router.get('/received', getReceivedBookings);
router.put('/:id/confirm', confirmBooking);
router.put('/:id/reject', rejectBooking);
router.put('/:id/complete', completeBooking);
router.delete('/:id', cancelBooking);

module.exports = router;
