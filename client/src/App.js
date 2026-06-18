import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import SkillLessons from './pages/SkillLessons';
import LessonExercises from './pages/LessonExercises';
import ExerciseTaker from './pages/ExerciseTaker';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Navigate replace to="/dashboard" />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><FileUpload /></PrivateRoute>} />
            <Route path="/skills/:skillId/lessons" element={<PrivateRoute><SkillLessons /></PrivateRoute>} />
            <Route path="/lessons/:lessonId/exercises" element={<PrivateRoute><LessonExercises /></PrivateRoute>} />
            <Route path="/exercises/:exerciseId/take" element={<PrivateRoute><ExerciseTaker /></PrivateRoute>} />
            {/* Catch-all for 404 */}
            <Route path="*" element={<div>404 - Not Found</div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;