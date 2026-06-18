# Duolingo Lesson Generator

A web application that generates Duolingo-style lessons from uploaded files (PDF, DOC, TXT, images, etc.) - not limited to language learning.

## Overview
This project consists of:
- **Backend**: Node.js/Express API with MongoDB (handles file processing, content analysis, and lesson generation)
- **Frontend**: React application (client) for user interaction

## Key Features (DUOrebuild Implementation)
- ✅ File processing for multiple formats (textract, pdf-parse, tesseract.js)
- ✅ Content analysis and keyword extraction (natural, stopword)
- ✅ Automatic skill, lesson, and exercise generation from uploaded content
- ✅ Fixed exercise linking to lessons (theoreticalExercises/practicalExercises arrays)
- ✅ User authentication (JWT-based)
- ✅ Interactive exercise taking with instant feedback

## Project Structure
```
duolingo-lesson-generator/
├── client/                 # React frontend (deploy to Netlify)
├── controllers/            # Express controllers
├── models/                 # MongoDB models
├── routes/                 # Express route definitions
├── utils/                  # Backend utilities:
│   ├── fileProcessor.js    # Text extraction and content processing
│   └── exerciseGenerator.js # Skill, lesson, and exercise generation
├── server.js               # Express entry point
├── package.json            # Root dependencies and scripts
├── .env.example            # Environment variables template
├── DEPLOYMENT_SUMMARY.md   # Details on the DUOrebuild implementation
└── NETLIFY_DEPLOYMENT.md   # Deployment guide for Netlify (client) and backend services
```

## Getting Started
See [`NETLIFY_DEPLOYMENT.md`](./NETLIFY_DEPLOYMENT.md) for detailed deployment instructions.

### Local Development
1. Install dependencies: `npm install`
2. Install client dependencies: `npm run install-client`
3. Create `.env` from `.env.example` and fill in values
4. Start MongoDB (local or use Atlas)
5. Run development servers: `npm run dev` (starts both backend and client)
   - Backend: http://localhost:5000
   - Client: http://localhost:3000 (proxied to backend for API calls)

### Deployment
- **Client**: Deploy to Netlify (see NETLIFY_DEPLOYMENT.md)
- **Backend**: Deploy to Nodejs-friendly service (Render, Railway, etc.)

## API Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get logged-in user (protected)
- `POST /api/upload` - Upload file for processing (protected)
- `GET /api/skills` - Get user's skills (protected)
- `GET /api/lessons/skill/:skillId` - Get lessons for a skill (protected)
- `GET /api/exercises/lesson/:lessonId` - Get exercises for a lesson (protected)
- `POST /api/exercises/submit` - Submit exercise answer (protected)

## Database Models
- **User**: name, email, password (hashed), etc.
- **Skill**: name, description, parentSkillId, order, createdBy
- **Lesson**: skillId, title, description, order, theoreticalExercises[], practicalExercises[], createdBy
- **Exercise**: type, question, options, correctAnswer, explanation, order, lessonId, createdBy, attempts, correctAttempts

## Exercise Types
- Theoretical (concept validation):
  - Multiple-choice
  - True/false
  - Fill-in-the-blank
- Practical (application):
  - Matching
  - Short-answer

## License
MIT