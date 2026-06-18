const Lesson = require('../models/Lesson');

// @desc    Get all lessons for user
// @route   GET /api/lessons
// @access  Private
exports.getLessons = async (req, res) => {
  try {
    const lessons = await Lesson.find({ createdBy: req.user.id }).sort({ order: 1 });
    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get lessons by skill ID
// @route   GET /api/lessons/skill/:skillId
// @access  Private
exports.getLessonsBySkill = async (req, res) => {
  try {
    const lessons = await Lesson.find({
      skillId: req.params.skillId,
      createdBy: req.user.id
    }).sort({ order: 1 });
    res.json(lessons);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get lesson by ID
// @route   GET /api/lessons/:id
// @access  Private
exports.getLessonById = async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    // Check if user owns the lesson
    if (lesson.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    res.json(lesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Create a lesson
// @route   POST /api/lessons
// @access  Private
exports.createLesson = async (req, res) => {
  try {
    const { skillId, title, description, order, theoreticalExercises, practicalExercises } = req.body;

    const lesson = new Lesson({
      skillId,
      title,
      description,
      order: order || 0,
      theoreticalExercises: theoreticalExercises || [],
      practicalExercises: practicalExercises || [],
      createdBy: req.user.id
    });

    const savedLesson = await lesson.save();
    res.json(savedLesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private
exports.updateLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    // Check if user owns the lesson
    if (lesson.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const { skillId, title, description, order, theoreticalExercises, practicalExercises } = req.body;

    lesson.skillId = skillId || lesson.skillId;
    lesson.title = title || lesson.title;
    lesson.description = description || lesson.description;
    lesson.order = order !== undefined ? order : lesson.order;
    lesson.theoreticalExercises = theoreticalExercises || lesson.theoreticalExercises;
    lesson.practicalExercises = practicalExercises || lesson.practicalExercises;

    const updatedLesson = await lesson.save();
    res.json(updatedLesson);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private
exports.deleteLesson = async (req, res) => {
  try {
    let lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    // Check if user owns the lesson
    if (lesson.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await lesson.remove();
    res.json({ msg: 'Lesson removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};