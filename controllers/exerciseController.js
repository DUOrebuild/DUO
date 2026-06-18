const Exercise = require('../models/Exercise');

// @desc    Submit exercise answer
// @route   POST /api/exercises/submit
// @access  Private
exports.submitExercise = async (req, res) => {
  try {
    const { exerciseId, answer } = req.body;

    const exercise = await Exercise.findById(exerciseId);

    if (!exercise) {
      return res.status(404).json({ msg: 'Exercise not found' });
    }

    // Check if user owns the exercise (through lesson)
    // For simplicity, we'll just check if the exercise exists and assume ownership is validated elsewhere
    // In a production app, you'd want to verify the user owns the lesson this exercise belongs to

    let isCorrect = false;
    let feedback = '';

    switch (exercise.type) {
      case 'multiple-choice':
        isCorrect = answer === exercise.correctAnswer;
        feedback = isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer is: ${exercise.options[exercise.correctAnswer]}`;
        break;

      case 'true-false':
        isCorrect = answer === exercise.correctAnswer;
        feedback = isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer is: ${exercise.correctAnswer ? 'True' : 'False'}`;
        break;

      case 'fill-in-blank':
        // Case-insensitive comparison for fill-in-the-blank
        isCorrect = answer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
        feedback = isCorrect
          ? 'Correct! Well done.'
          : `Incorrect. The correct answer is: "${exercise.correctAnswer}"`;
        break;

      case 'matching':
        // For matching exercises, answer should be an array of matched pairs
        // This is a simplified implementation
        isCorrect = JSON.stringify(answer.sort()) === JSON.stringify(exercise.correctAnswer.sort());
        feedback = isCorrect
          ? 'Correct! All pairs matched correctly.'
          : 'Incorrect. Please try again.';
        break;

      default:
        isCorrect = false;
        feedback = 'Unable to validate answer for this exercise type.';
    }

    // Update exercise attempt stats (optional)
    exercise.attempts = (exercise.attempts || 0) + 1;
    if (isCorrect) {
      exercise.correctAttempts = (exercise.correctAttempts || 0) + 1;
    }
    await exercise.save();

    res.json({
      correct: isCorrect,
      feedback: feedback,
      correctAnswer: exercise.correctAnswer
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get exercises by lesson ID
// @route   GET /api/exercises/lesson/:lessonId
// @access  Private
exports.getExercisesByLesson = async (req, res) => {
  try {
    const exercises = await Exercise.find({ lessonId: req.params.lessonId }).sort({ order: 1 });
    res.json(exercises);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// @desc    Get exercise by ID
// @route   GET /api/exercises/:id
// @access  Private
exports.getExerciseById = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({ msg: 'Exercise not found' });
    }

    // Check if user owns the exercise (through lesson) - simplified for now
    res.json(exercise);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};