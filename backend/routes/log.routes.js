const express = require('express');
const router = express.Router();
const { getLogs, getLogStats } = require('../controllers/log.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect, admin);

router.get('/', getLogs);
router.get('/stats', getLogStats);

module.exports = router;
