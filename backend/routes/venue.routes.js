const express = require('express');
const router = express.Router();
const { getVenues, getVenueById, createVenue, updateVenue, deleteVenue, searchVenues } = require('../controllers/venue.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public
router.get('/search', searchVenues);
router.get('/', getVenues);
router.get('/:id', getVenueById);

// Admin only
router.post('/', protect, admin, createVenue);
router.put('/:id', protect, admin, updateVenue);
router.delete('/:id', protect, admin, deleteVenue);

module.exports = router;
