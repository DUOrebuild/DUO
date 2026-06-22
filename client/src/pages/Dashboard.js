import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await axios.get('/api/skills', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSkills(res.data);
      } catch (err) {
        setError('Failed to load skills');
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, [token]);

  if (loading) return <div className="main-content">Loading skills...</div>;
  if (error) return <div className="main-content error">{error}</div>;

  return (
    <div className="main-content">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/upload" className="btn-primary">
          Upload New File
        </Link>
      </div>
      {skills.length === 0 ? (
        <p className="text-center">No skills yet. Upload a file to get started.</p>
      ) : (
        <div className="skills-grid">
          {skills.map(skill => (
            <div key={skill._id} className="skill-card">
              {/* In a real app, we would calculate progress from user data */}
              <div className="progress-circle" style={{ '--progress': '60%' }}>
                <div className="progress-text">60%</div>
                <div className="progress-label">Progress</div>
              </div>
              <h3>{skill.name}</h3>
              <p>{skill.description}</p>
              <Link to={`/skills/${skill._id}/lessons`} className="btn-link">
                View Lessons
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;