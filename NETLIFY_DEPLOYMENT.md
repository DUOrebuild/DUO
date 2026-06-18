# Netlify Deployment Guide for Duolingo Lesson Generator (Full-Stack)

## Overview
This guide explains how to deploy the Duolingo Lesson Generator as a full-stack application:
- **Client**: React app deployed to Netlify
- **Backend**: Node.js/Express API deployed to a separate service (Recommended: Render, Railway, etc.)

## 📁 Project Structure
```
duolingo-lesson-generator/
├── client/                 # React frontend (to be deployed to Netlify)
├── controllers/            # Express route handlers
├── models/                 # MongoDB models
├── routes/                 # Express routes
├── utils/                  # Backend utilities (fileProcessor, exerciseGenerator)
├── server.js               # Express entry point
├── package.json            # Root package (with scripts for client)
├── .env.example            # Environment variables template
├── DEPLOYMENT_SUMMARY.md   # DUOrebuild implementation details
└── NETLIFY_DEPLOYMENT.md   # This guide
```

## 🚀 Deployment Strategy

### 1. Backend Deployment (Render/Railway Recommended)
Deploy the Node.js/Express API to a service that supports persistent MongoDB connections.

**Steps:**
1. Choose a backend host:
   - [Render](https://render.com) (free tier available)
   - [Railway](https://railway.app) (free tier available)
   - [Heroku](https://heroku.com) (requires paid plan for MongoDB)
   - Or self-hosted VM/VPS

2. Configure environment variables in your hosting platform:
   ```
   PORT= (usually auto-assigned by the platform)
   MONGODB_URI= (your MongoDB connection string - use MongoDB Atlas free tier)
   JWT_SECRET= (generate a strong random string, e.g., 32+ characters)
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

3. Deploy the code:
   - Connect your GitHub repository to the hosting service
   - Set the build command to: `npm install`
   - Set the start command to: `npm run server` or `node server.js`
   - Enable automatic deploys on GitHub pushes

4. Verify your backend is running:
   - Visit your backend URL (e.g., `https://your-backend.onrender.com`)
   - Should see "MongoDB connected" and "Server running on port XXXX" in logs
   - Test API: `GET https://your-backend.onrender.com/api/skills` (should return empty array)

### 2. Frontend Deployment to Netlify
Deploy the React client to Netlify, which will communicate with your deployed backend.

**Steps:**
1. Push your code to GitHub (ensure the `client/` directory is included)
2. In Netlify:
   - Click "New site from Git"
   - Connect your GitHub repository
   - Configure build settings:
     - **Branch to deploy**: `main` (or your default branch)
     - **Build command**: `npm run build-client` (uses our root script)
     - **Publish directory**: `client/build`
   - Click "Show advanced" → "Environment"
   - Add environment variable:
     - Key: `REACT_APP_API_URL`
     - Value: `https://your-backend-service.com` (your deployed backend URL)
   - Click "Deploy site"

3. Netlify will:
   - Install root dependencies (via `npm install` in root)
   - Run `npm run build-client` (which runs `npm run build --prefix client`)
   - Deploy the `client/build` directory

### 3. Alternative: Monorepo Deployment on Netlify (Advanced)
If you prefer to deploy everything to Netlify (not recommended for this backend type due to serverless limitations), you would need to:
1. Convert the Express API to Netlify Functions
2. Adjust MongoDB connection handling for serverless environment
3. This approach is more complex and may have performance implications

**We recommend Strategy 1 & 2 above for best performance and reliability.**

## 🔧 Environment Variables

### Backend (Render/Railway/etc.)
| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster0.mongodb.net/dbname` |
| `JWT_SECRET` | Secret for JWT signing | `your-32-char-minimum-random-string-here` |
| `JWT_EXPIRES_IN` | JWT expiration | `7d` |
| `NODE_ENV` | Environment | `production` |
| `PORT` | Port (usually auto-assigned) | `(set by platform)` |

### Frontend (Netlify)
| Variable | Description | Example |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `https://your-backend.onrender.com` |

## 🛠️ Local Development

### Prerequisites
- Node.js (v16+)
- MongoDB (local or Atlas)
- Git

### Setup
1. Clone repository
2. Install root dependencies: `npm install`
3. Install client dependencies: `npm run install-client`
4. Create `.env` file from `.env.example` and fill in values
5. Start MongoDB (if using local)
6. Start development servers:
   ```bash
   # In one terminal:
   npm run server   # or npm run dev (runs both server and client)
   
   # Or separately:
   # Terminal 1: npm run server
   # Terminal 2: npm run client
   ```

The client will be available at `http://localhost:3000` (proxied to `http://localhost:5000` for API calls).

## 📝 Notes

### Why Separate Deployments?
- **Netlify** excels at static site hosting and serverless functions but is not ideal for long-running Node.js servers with persistent database connections.
- **Render/Railway** are optimized for traditional Node.js applications and handle MongoDB connections efficiently.
- This separation gives you the best of both worlds: Netlify's global CDN for the frontend and robust backend hosting for the API.

### MongoDB Recommendation
Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier:
1. Create a free account
2. Build a free cluster (M0)
3. Get your connection string
4. Whitelist your backend server's IP (or allow 0.0.0.0/0 for testing, then restrict)

### Security
- Never commit your `.env` file
- Use environment variables for all secrets
- In production, set `NODE_ENV=production`
- Consider adding rate limiting and input validation to backend routes (beyond basic implementation)

### Troubleshooting
#### Client Issues
- **Blank screen**: Check browser console for errors
- **API calls failing**: Verify `REACT_APP_API_URL` is set correctly in Netlify environment
- **Proxy not working in dev**: Ensure client's `package.json` has `"proxy": "http://localhost:5000"`

#### Backend Issues
- **MongoDB connection errors**: Verify `MONGODB_URI` and network access
- **JWT authentication errors**: Check `JWT_SECRET` matches and token is being sent
- **File upload failures**: Verify upload directory permissions and file size limits

## 🎯 Verification After Deployment

1. **Backend Health Check**:
   ```
   GET https://your-backend.com/
   ```
   Should show server status in logs

2. **API Endpoints**:
   - `GET https://your-backend.com/api/skills` (empty array initially)
   - `POST https://your-backend.com/api/upload` (with file - requires auth)

3. **Frontend Functionality**:
   - Visit your Netlify URL
   - Register a new account
   - Login
   - Upload a file (txt, pdf, image, etc.)
   - Wait for processing (check backend logs)
   - Navigate to Dashboard to see generated skills
   - Click into skills to see lessons and exercises
   - Take exercises to test submission

4. **Database Verification** (optional):
   - Use MongoDB Atlas UI or compass to check:
     - Users collection
     - Skills collection (should have documents)
     - Lessons collection (should have theoreticalExercises and practicalExercises arrays)
     - Exercises collection (should have documents with type, question, etc.)

## 📚 Related Documentation
- [DEPLOYMENT_SUMMARY.md](./DEPLOYMENT_SUMMARY.md): Details on the DUOrebuild implementation (file processing, exercise generation)
- [client/README.md](./client/README.md): Create-react-app generated documentation (if needed)

## 🎉 Your Duolingo Lesson Generator is Now Live!
Users can:
1. Register/Login
2. Upload files on any subject
3. Watch as the system automatically generates:
   - Skills (topics) from the content
   - Lessons for each skill (introduction, concepts, applications, etc.)
   - Exercises (multiple-choice, true/false, fill-in-blank, matching, short-answer)
4. Learn through interactive exercises with instant feedback

The system adapts to any content - not just languages - making it a versatile learning platform for any topic.