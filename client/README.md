# Duolingo Lesson Generator - Client

This is the React frontend for the Duolingo Lesson Generator application.

## Features
- User authentication (login/register)
- File upload to trigger content processing
- Dashboard showing generated skills
- Lesson and exercise browsing
- Interactive exercise taking with instant feedback

## Technology Stack
- React 18
- React Router v6
- Axios for HTTP requests
- JWT for authentication

## Available Scripts (in client directory)

In the client directory, you can run:

### `npm start`
Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`
Launches the test runner in the interactive watch mode.

### `npm run build`
Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration, you can `eject` at any time. This command will remove the single build dependency from your project.

## Environment Variables
Create a `.env` file in the client directory with:

```
REACT_APP_API_URL=http://localhost:5000   # for development
```

In production (Netlify), this is set via the Netlify site settings.

## Project Structure
```
client/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/   # Reusable components (PrivateRoute)
│   ├── context/      # React Context (AuthContext)
│   ├── pages/        # Page components (Login, Dashboard, etc.)
│   ├── utils/        # Utility files (api.js)
│   ├── App.js
│   ├── index.js
│   └── ...
└── package.json
```

## Deployment to Netlify
See the root [`NETLIFY_DEPLOYMENT.md`](../NETLIFY_DEPLOYMENT.md) for detailed instructions.

The client is designed to be deployed to Netlify while the backend is deployed to a separate service (Render, Railway, etc.) that supports Node.js and persistent MongoDB connections.

## Backend Communication
The client communicates with the backend API at the URL specified in `REACT_APP_API_URL`.
In development, the proxy in `package.json` forwards `/api/` requests to `http://localhost:5000`.
In production, Netlify serves the static files and makes API calls to the backend URL set in the environment variable.

## Features Implemented
- **Authentication**: Login, register, JWT storage
- **File Upload**: Sends file to backend for processing
- **Skills Dashboard**: Lists all generated skills
- **Skill Details**: Shows lessons for a skill
- **Lesson Details**: Shows exercises for a lesson (split by type)
- **Exercise Taker**: Allows users to answer exercises and see instant feedback
- **Responsive Design**: Works on mobile and desktop

## Extending the Application
To add new features:
1. Add new page components in `src/pages/`
2. Add routes in `src/App.js`
3. Add context or state management as needed in `src/context/`
4. Create reusable components in `src/components/` if applicable
5. Update CSS in `src/App.css` or create new component-specific styles