const UserProgress = require('../models/UserProgress');
const Lesson = require('../models/Lesson');

// @desc    Get user progress
// @route   GET /api/progress
// @access  Private
exports.getProgress = async (req, res) => {
  try {
    let progress = await UserProgress.findOne({ userId: req.user.id });

    // If no progress record exists, create one
    if (!progress) {
      progress = new UserProgress({
        userId: req.user.id,
        completedLessons: [],
        scores: {},
        streaks: 0,
        totalXP: 0
      });
      await progress.save();
    }

    res.json(progress);
  }catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Update user progress
// @route   POST /api/progress/update
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { lessonId, score, xpEarned } = req.body;

    // Validate lesson exists
    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ msg: 'Lesson not found' });
    }

    let progress = await UserProgress.findOne({ userId: req.user.id });

    // If no progress record exists, create one
    if (!progress) {
      progress = new UserProgress({
        userId: req.user.id,
        completedLessons: [],
        scores: {},
        streaks: 0,
        totalXP: 0
      });
    }

    // Add lesson to completed list if not already there
    if (!progress.completedLessons.includes(lessonId)) {
      progress.completedLessons.push(lessonId);
    }

    // Update score for this lesson
    progress.scores[lessonId] = score;

    // Update total XP
    progress.totalXP += xpEarned;

    // Update streak (simplified - in reality you'd check if lesson was completed today vs yesterday)
    progress.streaks += 1;

    await progress.save();

    res.json(progress);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Reset user progress
// @route   POST /api/progress/reset
// @access  Private
exports.resetProgress = async (req, res) => {
  try {
    await UserProgress.deleteOne({ userId: req.user.id });
    res.json({ msg: 'Progress reset successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};