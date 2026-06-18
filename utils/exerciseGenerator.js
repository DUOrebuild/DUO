const natural = require('natural');
const stopword = require('stopword');

/**
 * Generate skill hierarchy from processed content
 * @param {Object} processedContent - Output from fileProcessor.processContent
 * @param {string} userId - ID of the user creating the content
 * @returns {Array} Array of skill objects: {name, description, parentSkillId, order}
 */
exports.generateSkillsTree = (processedContent, userId) => {
  const { keyPhrases, sentences } = processedContent;

  // If no key phrases found, return a default skill
  if (!keyPhrases || keyPhrases.length === 0) {
    return [{
      name: 'General Topic',
      description: 'A general topic extracted from the uploaded content',
      parentSkillId: null,
      order: 0
    }];
  }

  // Group related key phrases into topics (simple approach: use first word or common prefixes)
  // For a more sophisticated approach, we could use clustering or NER
  const skills = [];

  // Create top-level skills from key phrases
  // We'll limit to a reasonable number of skills
  const maxSkills = Math.min(7, keyPhrases.length);

  for (let i = 0; i < maxSkills; i++) {
    const phrase = keyPhrases[i];

    // Create a skill name from the phrase (title case)
    const name = phrase
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Generate a description based on context from sentences
    const description = generateSkillDescription(phrase, sentences);

    skills.push({
      name: name,
      description: description,
      parentSkillId: null, // Top-level skills only for initial implementation
      order: i
    });
  }

  return skills;
};

/**
 * Generate a description for a skill based on its phrase and context sentences
 * @param {string} skillPhrase - The key phrase representing the skill
 * @param {Array} sentences - Array of sentences from the content
 * @returns {string} Description for the skill
 */
function generateSkillDescription(skillPhrase, sentences) {
  // Find sentences that contain the skill phrase (case insensitive)
  const relevantSentences = sentences.filter(sentence =>
    sentence.toLowerCase().includes(skillPhrase.toLowerCase())
  );

  if (relevantSentences.length > 0) {
    // Use the first relevant sentence, truncate if too long
    let description = relevantSentences[0];
    if (description.length > 200) {
      description = description.substring(0, 200) + '...';
    }
    return description;
  }

  // Fallback: generic description
  return `Learn about ${skillPhrase.toLowerCase()} and its applications`;
}

/**
 * Generate lessons for a specific skill
 * @param {Object} processedContent - Output from fileProcessor.processContent
 * @param {string} skillId - ID of the skill
 * @param {string} userId - ID of the user creating the content
 * @returns {Array} Array of lesson objects
 */
exports.generateLessonsForSkill = (processedContent, skillId, userId) => {
  const { keyPhrases, sentences } = processedContent;

  // Determine number of lessons based on content richness
  const numLessons = Math.min(5, Math.max(2, Math.floor(keyPhrases.length / 3)));

  const lessons = [];

  // Define lesson templates
  const lessonTemplates = [
    { type: 'introduction', titlePrefix: 'Introduction to', focus: 'basics and fundamentals' },
    { type: 'concepts', titlePrefix: 'Key Concepts in', focus: 'core principles and theory' },
    { type: 'applications', titlePrefix: 'Practical Applications of', focus: 'real-world usage and examples' },
    { type: 'best practices', titlePrefix: 'Best Practices for', focus: 'recommended approaches and techniques' },
    { type: 'advanced', titlePrefix: 'Advanced Topics in', focus: 'complex ideas and advanced techniques' }
  ];

  // Create lessons based on templates
  for (let i = 0; i < numLessons; i++) {
    const template = lessonTemplates[i % lessonTemplates.length];
    const skillName = keyPhrases[i] || 'the Topic';

    // Format skill name for title (title case)
    const formattedSkillName = skillName
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    lessons.push({
      skillId: skillId,
      title: `${template.titlePrefix} ${formattedSkillName}`,
      description: `${template.focus} related to ${skillName.toLowerCase()}.`,
      order: i,
      theoreticalExercises: [], // Will be populated after exercise generation
      practicalExercises: []    // Will be populated after exercise generation
    });
  }

  return lessons;
};

/**
 * Generate exercises for a specific lesson
 * @param {Object} processedContent - Output from fileProcessor.processContent
 * @param {string} lessonId - ID of the lesson
 * @param {string} userId - ID of the user creating the content
 * @returns {Array} Array of exercise objects
 */
exports.generateExercisesForLesson = (processedContent, lessonId, userId) => {
  const { keyPhrases, sentences, cleanedText } = processedContent;

  // Determine number of exercises based on content
  const numExercises = Math.min(8, Math.max(3, Math.floor(sentences.length / 2)));

  const exercises = [];

  // Define exercise types
  const exerciseTypes = [
    { type: 'multiple-choice', isTheoretical: true },
    { type: 'true-false', isTheoretical: true },
    { type: 'fill-in-blank', isTheoretical: true },
    { type: 'matching', isTheoretical: false }, // More practical
    { type: 'short-answer', isTheoretical: false } // More practical
  ];

  // Generate exercises
  for (let i = 0; i < numExercises; i++) {
    const exerciseType = exerciseTypes[i % exerciseTypes.length];
    const isTheoretical = exerciseType.isTheoretical;

    let exercise;

    switch (exerciseType.type) {
      case 'multiple-choice':
        exercise = generateMultipleChoiceExercise(processedContent, i);
        break;
      case 'true-false':
        exercise = generateTrueFalseExercise(processedContent, i);
        break;
      case 'fill-in-blank':
        exercise = generateFillInBlankExercise(processedContent, i);
        break;
      case 'matching':
        exercise = generateMatchingExercise(processedContent, i);
        break;
      case 'short-answer':
        exercise = generateShortAnswerExercise(processedContent, i);
        break;
      default:
        exercise = generateMultipleChoiceExercise(processedContent, i);
    }

    // Add metadata
    exercise.order = i;
    // lessonId and userId will be added by controller when creating Exercise instances

    exercises.push(exercise);
  }

  // Split exercises into theoretical and practical for return
  // Note: The controller will save all exercises and then split them for the lesson
  // We return all exercises here, and the controller will handle the splitting
  return exercises;
};

/**
 * Generate a multiple-choice exercise
 * @param {Object} processedContent - Processed content
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function generateMultipleChoiceExercise(processedContent, index) {
  const { keyPhrases, sentences } = processedContent;

  // Select a key phrase as the focus
  const focus = keyPhrases[index % keyPhrases.length] || 'the topic';
  const formattedFocus = focus
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Generate question
  const question = `What is a key aspect of ${formattedFocus}?`;

  // Generate options: one correct, three distractors
  const correctAnswer = `An important concept related to ${focus.toLowerCase()}`;

  // Generate plausible distractors
  const distractors = [
    `A concept unrelated to ${focus.toLowerCase()}`,
    `A historical note about ${focus.toLowerCase()}`,
    `A framework for implementing ${focus.toLowerCase()}`
  ];

  // Shuffle options
  const options = [correctAnswer, ...distractors];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }

  // Find correct answer index
  const correctIndex = options.indexOf(correctAnswer);

  return {
    type: 'multiple-choice',
    question: question,
    options: options,
    correctAnswer: correctIndex,
    explanation: `The correct answer identifies a key aspect of ${formattedFocus}.`
  };
}

/**
 * Generate a true/false exercise
 * @param {Object} processedContent - Processed content
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function generateTrueFalseExercise(processedContent, index) {
  const { keyPhrases, sentences } = processedContent;

  // Select a key phrase
  const focus = keyPhrases[index % keyPhrases.length] || 'the topic';

  // Generate a statement (sometimes true, sometimes false)
  const makeTrue = index % 2 === 0; // Alternate true/false

  let question;
  let correctAnswer;

  if (makeTrue) {
    question = `${focus.charAt(0).toUpperCase() + focus.slice(1)} is an important concept in the subject matter.`;
    correctAnswer = true;
  } else {
    question = `${focus.charAt(0).toUpperCase() + focus.slice(1)} is only relevant in historical contexts.`;
    correctAnswer = false;
  }

  return {
    type: 'true-false',
    question: question,
    correctAnswer: correctAnswer,
    explanation: correctAnswer
      ? `The statement correctly identifies ${focus} as an important concept.`
      : `The statement is incorrect; ${focus} has contemporary relevance and applications.`
  };
}

/**
 * Generate a fill-in-the-blank exercise
 * @param {Object} processedContent - Processed content
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function generateFillInBlankExercise(processedContent, index) {
  const { keyPhrases, sentences } = processedContent;

  // Select a sentence that contains a key phrase
  const focus = keyPhrases[index % keyPhrases.length] || keyPhrases[0] || 'topic';

  // Find a sentence containing this focus
  const relevantSentence = sentences.find(s =>
    s.toLowerCase().includes(focus.toLowerCase())
  ) || sentences[0] || `This content discusses ${focus} and its applications.`;

  // Create a fill-in-the-blank version
  const escapedFocus = focus.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
  const pattern = new RegExp(`\\b${escapedFocus}\\b`, 'i');
  const question = relevantSentence.replace(pattern, '_____');

  return {
    type: 'fill-in-blank',
    question: question,
    correctAnswer: focus,
    explanation: `The blank should be filled with "${focus}", which is a key concept discussed in the content.`
  };
}

/**
 * Generate a matching exercise
 * @param {Object} processedContent - Processed content
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function generateMatchingExercise(processedContent, index) {
  const { keyPhrases } = processedContent;

  // Create pairs of related concepts
  const phrases = keyPhrases.slice(0, Math.min(6, keyPhrases.length));

  if (phrases.length < 2) {
    // Fallback if not enough phrases
    return {
      type: 'matching',
      question: 'Match the related concepts:',
      options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'],
      correctAnswer: [0, 2, 1, 3], // Example: A-C, B-D
      explanation: 'Match each concept on the left with its related concept on the right.'
    };
  }

  // Create pairs: first half matches with second half
  const mid = Math.ceil(phrases.length / 2);
  const left = phrases.slice(0, mid);
  const right = phrases.slice(mid);

  // Ensure we have equal lengths by duplicating or truncating
  while (left.length < right.length) left.push(left[left.length - 1] || 'Concept');
  while (right.length < left.length) right.push(right[right.length - 1] || 'Concept');

  // Create options array: left side + right side
  const options = [...left, ...right];

  // Create correct answer pairs: left[i] matches with right[i]
  const correctAnswer = [];
  for (let i = 0; i < left.length; i++) {
    correctAnswer.push(i); // left[i]
    correctAnswer.push(mid + i); // right[i]
  }

  // Format question
  const question = 'Match each item on the left with its related item on the right:';

  return {
    type: 'matching',
    question: question,
    options: options,
    correctAnswer: correctAnswer,
    explanation: 'Match related concepts based on their relationship in the content.'
  };
}

/**
 * Generate a short answer exercise
 * @param {Object} processedContent - Processed content
 * @param {number} index - Exercise index
 * @returns {Object} Exercise object
 */
function generateShortAnswerExercise(processedContent, index) {
  const { keyPhrases, sentences } = processedContent;

  // Select a key phrase
  const focus = keyPhrases[index % keyPhrases.length] || 'the topic';

  // Generate a question asking for explanation
  const question = `Explain the importance of ${focus
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')} in the context of the provided material.`;

  return {
    type: 'short-answer',
    question: question,
    correctAnswer: `A description of ${focus.toLowerCase()} and its significance.`,
    explanation: `Answers should explain what ${focus} is and why it matters in the given context.`
  };
}