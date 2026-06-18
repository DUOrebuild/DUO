const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const { protect } = require('../middleware/auth');

router.post('/submit', protect, exerciseController.submitExercise);
router.get('/lesson/:lessonId', protect, exerciseController.getExercisesByLesson);
router.get('/:id', protect, exerciseController.getExerciseById);

module.exports = router;