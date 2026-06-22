import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const LessonExercises = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get lesson details (optional, for title)
        const lessonRes = await axios.get(`/api/lessons/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLessonTitle(lessonRes.data.title);

        // Get exercises for this lesson
        const exercisesRes = await axios.get(`/api/exercises/lesson/${lessonId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExercises(exercisesRes.data);
      } catch (err) {
        setError('Failed to load exercises');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, lessonId]);

  if (loading) return <div className="main-content">Loading exercises...</div>;
  if (error) return <div className="main-content error">{error}</div>;

  // Split exercises into theoretical and practical
  const theoretical = exercises.filter(ex =>
    ['multiple-choice', 'true-false', 'fill-in-blank'].includes(ex.type)
  );
  const practical = exercises.filter(ex =>
    ['matching', 'short-answer'].includes(ex.type)
  );

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h2>{lessonTitle}</h2>
        <Link to={`/skills/${exercises[0]?.skillId}/lessons`} className="btn-link">
          ← Back to Lessons
        </Link>
      </div>

      <div className="exercises-section">
        <h3>Theoretical Exercises</h3>
        {theoretical.length === 0 ? (
          <p className="text-center">No theoretical exercises.</p>
        ) : (
          <div className="exercises-list">
            {theoretical.map(ex => (
              <div key={ex._id} className="exercise-card">
                <h4>{ex.question}</h4>
                {ex.type === 'multiple-choice' && (
                  <>
                    <p>Options:</p>
                    <ul>
                      {ex.options.map((opt, idx) => (
                        <li key={idx}>{opt}</li>
                      ))}
                    </ul>
                  </>
                )}
                {ex.type === 'true-false' && (
                  <p>Answer: {ex.correctAnswer ? 'True' : 'False'}</p>
                )}
                {ex.type === 'fill-in-blank' && (
                  <p>Answer: {ex.correctAnswer}</p>
                )}
                <Link
                  to={`/exercises/${ex._id}/take`}
                  className="btn-link"
                >
                  Take Exercise
                </Link>
              </div>
            ))}
          </div>
        )}

        <h3>Practical Exercises</h3>
        {practical.length === 0 ? (
          <p className="text-center">No practical exercises.</p>
        ) : (
          <div className="exercises-list">
            {practical.map(ex => (
              <div key={ex._id} className="exercise-card">
                <h4>{ex.question}</h4>
                {ex.type === 'matching' && (
                  <>
                    <p>Match the following:</p>
                    <p>{JSON.stringify(ex.options)}</p>
                    <p>Correct pairs: {JSON.stringify(ex.correctAnswer)}</p>
                  </>
                )}
                {ex.type === 'short-answer' && (
                  <p>Answer: {ex.correctAnswer}</p>
                )}
                <Link
                  to={`/exercises/${ex._id}/take`}
                  className="btn-link"
                >
                  Take Exercise
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonExercises;