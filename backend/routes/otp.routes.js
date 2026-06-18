const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp } = require('../controllers/otp.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/send', protect, sendOtp);
router.post('/verify', protect, verifyOtp);

module.exports = router;
