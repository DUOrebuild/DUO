const Skill = require('../models/Skill');

// @desc    Get all skills for user
// @route   GET /api/skills
// @access  Private
exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.find({ createdBy: req.user.id }).sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a skill
// @route   POST /api/skills
// @access  Private
exports.createSkill = async (req, res) => {
  try {
    const { name, description, parentSkillId, order } = req.body;

    const skill = new Skill({
      name,
      description,
      parentSkillId: parentSkillId || null,
      order: order || 0,
      createdBy: req.user.id
    });

    const savedSkill = await skill.save();
    res.json(savedSkill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get skill by ID
// @route   GET /api/skills/:id
// @access  Private
exports.getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    // Check if user owns the skill
    if (skill.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(skill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update skill
// @route   PUT /api/skills/:id
// @access  Private
exports.updateSkill = async (req, res) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    // Check if user owns the skill
    if (skill.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const { name, description, parentSkillId, order } = req.body;

    skill.name = name || skill.name;
    skill.description = description || skill.description;
    skill.parentSkillId = parentSkillId !== undefined ? parentSkillId : skill.parentSkillId;
    skill.order = order !== undefined ? order : skill.order;

    const updatedSkill = await skill.save();
    res.json(updatedSkill);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete skill
// @route   DELETE /api/skills/:id
// @access  Private
exports.deleteSkill = async (req, res) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ msg: 'Skill not found' });
    }

    // Check if user owns the skill
    if (skill.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await skill.remove();
    res.json({ msg: 'Skill removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};