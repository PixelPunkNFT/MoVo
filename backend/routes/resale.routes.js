const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createResale,
  getResales,
  getResaleById,
  updateResale,
  deleteResale,
  markAsSold,
  claimResale,
  contactSeller,
  getMyResales,
  getMyBuyRequests
} = require('../controllers/resale.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getResales);
router.get('/:id', getResaleById);

// Protected routes
router.get('/my', protect, getMyResales);
router.get('/my-requests', protect, getMyBuyRequests);
router.post('/', protect, upload.array('screenshots', 5), createResale);
router.put('/:id', protect, upload.array('screenshots', 5), updateResale);
router.delete('/:id', protect, deleteResale);
router.put('/:id/sold', protect, markAsSold);
router.post('/:id/claim', protect, claimResale);
router.post('/:id/contact', protect, contactSeller);

module.exports = router;
