import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FileUpload = () => {
  const { token } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }
    setUploading(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setSuccess('File uploaded and processed successfully!');
      // Optionally, redirect to dashboard or show the new skill
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="upload-container">
        <div className="upload-card">
          <h1>Upload File to Generate Lessons</h1>
          <p>Supported formats: PDF, DOC, TXT, Images (JPG, PNG, etc.)</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Choose a file:</label>
              <input
                type="file"
                onChange={handleFileChange}
                required
                className="form-input"
              />
            </div>
            <button type="submit" disabled={uploading} className="btn-primary">
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
            {error && <p className="error">{error}</p>}
            {success && <p className="success">{success}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;