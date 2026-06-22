import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const SkillLessons = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const { skillId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [skillName, setSkillName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get skill details (optional, for title)
        const skillRes = await axios.get(`/api/skills/${skillId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSkillName(skillRes.data.name);

        // Get lessons for this skill
        const lessonsRes = await axios.get(`/api/lessons/skill/${skillId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setLessons(lessonsRes.data);
      } catch (err) {
        setError('Failed to load lessons');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, skillId]);

  if (loading) return <div className="main-content">Loading lessons...</div>;
  if (error) return <div className="main-content error">{error}</div>;

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h2>{skillName}</h2>
        <Link to="/dashboard" className="btn-link">
          ← Back to Dashboard
        </Link>
      </div>
      {lessons.length === 0 ? (
        <p className="text-center">No lessons yet for this skill.</p>
      ) : (
        <div className="lessons-grid">
          {lessons.map(lesson => (
            <div key={lesson._id} className="lesson-card">
              {/* In a real app, we would calculate progress from user data */}
              <div className="progress-circle" style={{ '--progress': '75%' }}>
                <div className="progress-text">75%</div>
                <div className="progress-label">Progress</div>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <Link
                to={`/lessons/${lesson._id}/exercises`}
                className="btn-link"
              >
                View Exercises
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillLessons;