import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { token } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) return <div>Loading skills...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <Link to="/upload" className="btn-primary">
        Upload New File
      </Link>
      {skills.length === 0 ? (
        <p>No skills yet. Upload a file to get started.</p>
      ) : (
        <div className="skills-grid">
          {skills.map(skill => (
            <div key={skill._id} className="skill-card">
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