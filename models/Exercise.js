const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'matching', 'short-answer']
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }], // For multiple-choice and matching
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed, // Can be string, number, boolean, or array
    required: true
  },
  explanation: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attempts: {
    type: Number,
    default: 0
  },
  correctAttempts: {
    type: Number,
    default: 0
  },
  dateCreated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Exercise', ExerciseSchema);