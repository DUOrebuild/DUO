const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { protect } = require('../middleware/auth');

router.get('/', protect, lessonController.getLessons);
router.get('/skill/:skillId', protect, lessonController.getLessonsBySkill);
router.get('/:id', protect, lessonController.getLessonById);
router.post('/', protect, lessonController.createLesson);
router.put('/:id', protect, lessonController.updateLesson);
router.delete('/:id', protect, lessonController.deleteLesson);

module.exports = router;