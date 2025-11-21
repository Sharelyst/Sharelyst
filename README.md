# Sharelyst - Mobile Application

Main repository containing all source code for Sharelyst.

Sharelyst is a React Native mobile application built with Expo, featuring a complete authentication system and social features.

## Project Structure

This repository contains two main folders:

- **`backend/`** - Node.js/Express backend server
- **`SharelystApp/`** - React Native frontend application (Expo)

## Quick Start

#### 1. Backend Server

The backend is **always running** on Render at:
```
https://sharelystbackend.onrender.com/
```

**Before running the app**, visit the backend URL and wait for the success message that says `true`. This ensures the server is fully loaded and ready.

#### 2. Frontend App

```bash
cd SharelystApp
npx expo start
```

#### 3. After Installing New Packages

If you install any new packages, always run with the clear flag:

```bash
npx expo start --clear
```

## Git Workflow & Branching Strategy

### Branch Structure
- **`main`** - Production branch (do not work directly on this)
- **`backend`** - Backend development branch
- **`frontend`** - Frontend development branch

### Adding New Features

**IMPORTANT**: When creating a new feature branch, always branch from `frontend` (NOT from `main`).

```bash
# Switch to frontend branch
git checkout frontend
git pull origin frontend

# Create new feature branch
git checkout -b feature-name

# Work on your feature...

# Push feature branch
git push origin feature-name
```

## Features

### Authentication System
- **User Registration** - Create new accounts with username, email, and password
- **User Login** - Sign in with username OR email
- **Secure Password Storage** - Bcrypt hashing
- **JWT Token Authentication** - Secure token-based auth
- **Protected Routes** - Authentication required for app access
- **Persistent Sessions** - Tokens stored securely, survive app restarts
- **Logout Functionality** - Secure logout with token cleanup

### Security Features
- Password hashing with bcrypt
- Secure token storage (expo-secure-store)
- Input validation (client & server side)
- Email & username uniqueness checks
- JWT token verification

## Tech Stack

### Frontend (SharelystApp/)
- **React Native** - Mobile app framework
- **Expo** - Development platform
- **TypeScript** - Type safety
- **expo-router** - File-based routing
- **expo-secure-store** - Secure token storage
- **axios** - HTTP client

### Backend (backend/)
- **Node.js** - Runtime environment
- **Express** - Web framework
- **SQLite** - Database
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **Render** - Cloud hosting

## Project Structure

```
Sharelyst/
├── backend/                     # Backend server (hosted on Render)
│   ├── routes/
│   │   └── auth.js             # Authentication endpoints
│   ├── database/
│   │   ├── initDb.js           # Database initialization
│   │   └── utils.js            # Database utilities
│   ├── middleware/
│   │   ├── auth.js             # Auth middleware
│   │   ├── errorHandler.js    # Error handling
│   │   └── validation.js      # Input validation
│   ├── config/
│   │   └── index.js            # Configuration
│   ├── index.js                # Express server entry point
│   ├── testAuth.js             # Automated tests
│   └── package.json            # Backend dependencies
│
└── SharelystApp/               # Frontend React Native app
    ├── app/
    │   ├── _layout.tsx         # Root layout with auth protection
    │   ├── login.tsx           # Login screen
    │   ├── register.tsx        # Registration screen
    │   └── (tabs)/             # Tab navigation
    │       ├── _layout.tsx
    │       ├── index.tsx       # Home tab
    │       └── explore.tsx     # Explore tab
    ├── contexts/
    │   └── AuthContext.tsx     # Global auth state management
    ├── components/             # Reusable UI components
    ├── constants/              # App constants & theme
    ├── hooks/                  # Custom React hooks
    └── package.json            # Frontend dependencies
```

## Backend API

**Base URL**: `https://sharelystbackend.onrender.com/`

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/verify
```

The backend is hosted on Render and runs 24/7. Always verify it's loaded before running the app.

## Troubleshooting

### Backend not responding
- Visit `https://sharelystbackend.onrender.com/` in your browser
- Wait for the success message (`true`) before running the app
- Render may spin down after inactivity; it takes ~30 seconds to wake up

### App won't connect to backend
- Ensure backend is fully loaded (visit URL first)
- Check your internet connection
- Verify the API URL in `AuthContext.tsx` is correct

### Cache issues after installing packages
- Always run `npx expo start --clear` after installing new packages
- This clears the Metro bundler cache

### TypeScript errors in editor
- Some errors may appear in the IDE but don't affect functionality
- The app will compile and run correctly

## Development Notes

### Backend Development
- Backend is hosted on Render (production)
- Use the `backend` branch for backend changes
- Test locally before pushing to production

### Frontend Development
- Use the `frontend` branch as your base
- Create feature branches from `frontend` (NOT `main`)
- Run with `npx expo start --clear` after installing packages

### Database
- SQLite database hosted with backend on Render
- Schema: users table with id, username, email, password_hash, created_at

## Team
Yuriy Kotyashko 
Stefewn Johnson 
Muhammad Zamin
Daniel Chahine