const express = require('express');
const router = express.Router();
const {
  createRide,
  searchRides,
  getRideById,
  getMyRidesAsDriver,
  updateRide,
  cancelRide,
  createSpontaneousRide,
  joinSpontaneousRide
} = require('../controllers/ride.controller');
const { protect, requireVehicle } = require('../middleware/auth.middleware');
const { createRideValidation, validate } = require('../middleware/validation.middleware');
const { createLimiter } = require('../middleware/rateLimiter.middleware');

// Public routes
router.get('/search', searchRides);
router.get('/:id', getRideById);

// Protected routes
router.post('/spontaneous', protect, createLimiter, createSpontaneousRide);
router.post('/:id/join', protect, joinSpontaneousRide);
router.post('/', protect, requireVehicle, createLimiter, createRideValidation, validate, createRide);
router.get('/my-rides/driver', protect, getMyRidesAsDriver);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);

module.exports = router;
