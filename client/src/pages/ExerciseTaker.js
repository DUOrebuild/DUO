import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ExerciseTaker = () => {
  const { token } = useAuth();
  const { exerciseId } = useParams();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { correct: boolean, feedback: string, correctAnswer: any }

  // State for user answer based on exercise type
  const [answer, setAnswer] = useState(''); // for text-based answers
  const [selectedOption, setSelectedOption] = useState(null); // for multiple choice
  const [tfAnswer, setTfAnswer] = useState(null); // for true/false

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const res = await axios.get(`/api/exercises/${exerciseId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExercise(res.data);
      } catch (err) {
        setError('Failed to load exercise');
      } finally {
        setLoading(false);
      }
    };
    fetchExercise();
  }, [token, exerciseId]);

  if (loading) return <div className="main-content">Loading exercise...</div>;
  if (error) return <div className="main-content error">{error}</div>;
  if (!exercise) return <div>Exercise not found</div>;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setResult(null);

    let answerToSend;
    switch (exercise.type) {
      case 'multiple-choice':
        answerToSend = selectedOption;
        break;
      case 'true-false':
        answerToSend = tfAnswer === 'true';
        break;
      case 'fill-in-blank':
        answerToSend = answer;
        break;
      case 'matching':
        // For simplicity, we'll send the answer as a string (not ideal)
        // In a real app, you'd have a more complex UI for matching
        answerToSend = answer;
        break;
      case 'short-answer':
        answerToSend = answer;
        break;
      default:
        answerToSend = answer;
    }

    try {
      const res = await axios.post(
        `/api/exercises/submit`,
        { exerciseId, answer: answerToSend },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setResult(res.data);
    } catch (err) {
      setError('Failed to submit answer');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h2>Exercise</h2>
        <button onClick={() => navigate(-1)} className="btn-link">
            ← Back
          </button>
      </div>

      <div className="exercise-content">
        <h3>{exercise.question}</h3>

        {exercise.type === 'multiple-choice' && (
          <>
            <p>Select an option:</p>
            <div className="options-list">
              {exercise.options.map((opt, idx) => (
                <label key={idx} className="option-label">
                  <input
                    type="radio"
                    value={idx}
                    checked={selectedOption === idx}
                    onChange={(e) => setSelectedOption(parseInt(e.target.value))}
                    disabled={submitting}
                  />
                  <span className="option-text">{opt}</span>
                </label>
              ))}
            </div>
          </>
        )}

        {exercise.type === 'true-false' && (
          <>
            <p>Select True or False:</p>
            <div className="options-list">
              <label className="option-label">
                <input
                  type="radio"
                  value="true"
                  checked={tfAnswer === 'true'}
                  onChange={(e) => setTfAnswer(e.target.value)}
                  disabled={submitting}
                />
                <span className="option-text">True</span>
              </label>
              <label className="option-label">
                <input
                  type="radio"
                  value="false"
                  checked={tfAnswer === 'false'}
                  onChange={(e) => setTfAnswer(e.target.value)}
                  disabled={submitting}
                />
                <span className="option-text">False</span>
              </label>
            </div>
          </>
        )}

        {exercise.type === 'fill-in-blank' && (
          <>
            <p>Fill in the blank:</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              placeholder="Enter your answer"
              className="form-input"
            />
          </>
        )}

        {exercise.type === 'matching' && (
          <>
            <p>Match the following items (enter pairs as "left:right,left2:right2"):</p>
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              placeholder="e.g., A:1,B:2,C:3"
              className="form-input"
            />
            <p className="hint"><small>Options: {JSON.stringify(exercise.options)}</small></p>
            <p className="hint"><small>Correct pairs: {JSON.stringify(exercise.correctAnswer)}</small></p>
          </>
        )}

        {exercise.type === 'short-answer' && (
          <>
            <p>Provide your answer:</p>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={submitting}
              rows="4"
              placeholder="Enter your answer"
              className="form-input"
            />
          </>
        )}
      </div>

      <div className="actions">
        <button
          type="submit"
          onClick={handleSubmit}
          disabled={submitting || !exercise}
          className="btn-primary"
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      </div>

      {result && (
        <div className={`result ${result.correct ? 'correct' : 'incorrect'}`}>
          <h3>{result.correct ? 'Correct!' : 'Incorrect'}</h3>
          <p>{result.feedback}</p>
          {!result.correct && (
            <p>
              Correct answer: {JSON.stringify(result.correctAnswer)}
            </p>
          )}
          <button
            onClick={() => navigate(-1)}
            className="btn-link"
          >
            Back to Exercise List
          </button>
        </div>
      )}
    </div>
  );
};

export default ExerciseTaker;