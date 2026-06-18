const express = require('express');
const router = express.Router();
const {
  toggleFavorite,
  getMyFavorites,
  checkFavorite
} = require('../controllers/favorite.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/', protect, getMyFavorites);
router.post('/:resaleId', protect, toggleFavorite);
router.get('/:resaleId/check', protect, checkFavorite);

module.exports = router;
