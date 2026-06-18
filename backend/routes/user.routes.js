const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  searchUsers
} = require('../controllers/user.controller');

// Public routes
router.get('/search', searchUsers);
router.get('/:userId', getUserProfile);

module.exports = router;
