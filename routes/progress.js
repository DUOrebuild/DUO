const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/', protect, progressController.getProgress);
router.post('/update', protect, progressController.updateProgress);
router.post('/reset', protect, progressController.resetProgress);

module.exports = router;