const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const Skill = require('../models/Skill');
const Lesson = require('../models/Lesson');
const Exercise = require('../models/Exercise');
const fileProcessor = require('../utils/fileProcessor');
const exerciseGenerator = require('../utils/exerciseGenerator');

// @desc    Upload file and process for lesson generation
// @route   POST /api/upload
// @access  Private
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    const mimetype = req.file.mimetype;

    // Extract text content from file
    const extractedText = await fileProcessor.extractText(filePath, mimetype);

    // Process extracted text to identify topics and generate content
    const processedContent = await fileProcessor.processContent(extractedText);

    // Generate skills tree from processed content
    const skillsData = await exerciseGenerator.generateSkillsTree(processedContent, req.user.id);

    // Save skills to database
    const savedSkills = [];
    for (const skillData of skillsData) {
      const skill = new Skill({
        ...skillData,
        createdBy: req.user.id
      });
      const savedSkill = await skill.save();
      savedSkills.push(savedSkill);

      // Generate lessons for each skill
      const lessonsData = await exerciseGenerator.generateLessonsForSkill(
        processedContent,
        savedSkill._id,
        req.user.id
      );

      // Save lessons
      for (const lessonData of lessonsData) {
        const lesson = new Lesson({
          ...lessonData,
          skillId: savedSkill._id,
          createdBy: req.user.id
        });
        const savedLesson = await lesson.save();

        // Generate exercises for each lesson (theoretical and practical blocks)
        const exercisesData = await exerciseGenerator.generateExercisesForLesson(
          processedContent,
          savedLesson._id,
          req.user.id
        );

        // Save exercises
        const savedExercises = [];
        for (const exerciseData of exercisesData) {
          const exercise = new Exercise({
            ...exerciseData,
            lessonId: savedLesson._id,
            createdBy: req.user.id
          });
          const savedExercise = await exercise.save();
          savedExercises.push(savedExercise);
        }

        // Update lesson with exercise references
        // Split exercises into theoretical and practical based on type
        const theoreticalExercises = savedExercises
          .filter(exercise =>
            ['multiple-choice', 'true-false', 'fill-in-blank'].includes(exercise.type)
          )
          .map(exercise => exercise._id);
        const practicalExercises = savedExercises
          .filter(exercise =>
            ['matching', 'short-answer'].includes(exercise.type)
          )
          .map(exercise => exercise._id);

        // Update lesson
        savedLesson.theoreticalExercises = theoreticalExercises;
        savedLesson.practicalExercises = practicalExercises;
        await savedLesson.save();
      }
    }

    // Clean up uploaded file
    await unlinkAsync(filePath);

    res.json({
      msg: 'File uploaded and processed successfully',
      skills: savedSkills
    });
  } catch (err) {
    console.error(err.message);
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    res.status(500).json({ msg: 'Server error' });
  }
};