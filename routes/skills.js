const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const { protect } = require('../middleware/auth');

router.get('/', protect, skillController.getSkills);
router.post('/', protect, skillController.createSkill);
router.get('/:id', protect, skillController.getSkillById);
router.put('/:id', protect, skillController.updateSkill);
router.delete('/:id', protect, skillController.deleteSkill);

module.exports = router;