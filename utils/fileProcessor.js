const textract = require('textract');
const pdf = require('pdf-parse');
const Tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const natural = require('natural');
const stopword = require('stopword');

/**
 * Extract text from various file formats
 * @param {string} filePath - Path to the file
 * @param {string} mimetype - MIME type of the file
 * @returns {Promise<string>} Extracted text
 */
exports.extractText = async (filePath, mimetype) => {
  try {
    // Handle images with Tesseract OCR
    if (mimetype.startsWith('image/')) {
      try {
        const { data: { text } } = await Tesseract.recognize(
          filePath,
          'eng', // English language
          { logger: m => {} } // Disable logger for cleaner output
        );
        return text;
      } catch (ocrError) {
        console.warn(`OCR failed for ${filePath}, falling back to textract:`, ocrError.message);
        // Fall back to textract
      }
    }

    // Handle PDFs with pdf-parse for better text extraction
    if (mimetype === 'application/pdf') {
      try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
      } catch (pdfError) {
        console.warn(`PDF parse failed for ${filePath}, falling back to textract:`, pdfError.message);
        // Fall back to textract
      }
    }

    // Use textract for all other formats (and as fallback)
    return new Promise((resolve, reject) => {
      textract.fromFileWithPath(filePath, { preserveLineBreaks: true }, (error, text) => {
        if (error) {
          reject(error);
        } else {
          resolve(text);
        }
      });
    });
  } catch (error) {
    console.error(`Error extracting text from ${filePath}:`, error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

/**
 * Process and clean extracted text for content analysis
 * @param {string} text - Raw extracted text
 * @returns {Object} Processed content with sentences, key phrases, etc.
 */
exports.processContent = (text) => {
  // Clean text: remove extra whitespace, normalize
  const cleanedText = text
    .replace(/\s+/g, ' ') // Replace multiple spaces/newlines with single space
    .replace(/^\s+|\s+$/g, '') // Trim leading/trailing whitespace
    .trim();

  // Split into sentences
  const tokenizer = new natural.SentenceTokenizer();
  const sentences = tokenizer.tokenize(cleanedText);

  // Tokenize words
  const wordTokenizer = new natural.WordTokenizer();
  const words = wordTokenizer.tokenize(cleanedText.toLowerCase());

  // Remove stopwords
  const filteredWords = stopword.removeStopwords(words);

  // Extract noun phrases (simple approach: look for sequences of nouns)
  // For better results, we could use POS tagging, but we'll keep it simple for now
  const wordFreq = {};
  filteredWords.forEach(word => {
    if (word.length > 2) { // Ignore very short words
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });

  // Get top keywords by frequency
  const keyPhrases = Object.entries(wordFreq)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 20) // Top 20 keywords
    .map(([word]) => word);

  // Also extract potential noun phrases (simplified)
  // Look for patterns like "adjective noun" or "noun noun"
  const nounPhrases = [];
  for (let i = 0; i < words.length - 1; i++) {
    const word1 = words[i];
    const word2 = words[i + 1];
    if (word1.length > 2 && word2.length > 2 &&
        !stopword.stopwords.includes(word1) && !stopword.stopwords.includes(word2)) {
      nounPhrases.push(`${word1} ${word2}`);
    }
  }

  // Add unique noun phrases to key phrases
  nounPhrases.forEach(phrase => {
    if (!keyPhrases.includes(phrase) && phrase.length > 3) {
      keyPhrases.push(phrase);
    }
  });

  // Limit to reasonable number
  const finalKeyPhrases = keyPhrases.slice(0, 30);

  return {
    rawText: text,
    cleanedText: cleanedText,
    sentences: sentences,
    keyPhrases: finalKeyPhrases,
    wordCount: words.length,
    sentenceCount: sentences.length
  };
};