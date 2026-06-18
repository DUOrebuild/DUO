const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');

router.post('/', protect, uploadController.uploadFile);

module.exports = router;