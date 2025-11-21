# Sharelyst Authentication System

## Overview
Complete authentication system with secure login and registration for the Sharelyst application.

## Features Implemented

### ✅ Backend (Node.js/Express)
- **Database**: SQLite with `users` table
- **Password Security**: Bcrypt hashing (10 salt rounds)
- **JWT Authentication**: 7-day token expiration
- **API Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login  
  - `POST /api/auth/verify` - Token verification

### ✅ Frontend (React Native/Expo)
- **Authentication Screens**:
  - Login screen (username/email + password)
  - Registration screen (username, email, password, confirm password)
- **Secure Storage**: expo-secure-store for JWT tokens
- **Global State**: React Context API for auth state management
- **Protected Routes**: Automatic redirect based on auth status

## Database Schema

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## Security Features

1. **Password Requirements**:
   - Minimum 6 characters
   - Bcrypt hashing with 10 salt rounds
   - Passwords never stored in plain text

2. **Unique Constraints**:
   - Usernames must be unique
   - Email addresses must be unique
   - Proper validation on both client and server

3. **JWT Tokens**:
   - Stored securely using expo-secure-store
   - 7-day expiration
   - Verified on app startup

4. **Input Validation**:
   - Email format validation
   - Password confirmation matching
   - Trimmed whitespace
   - Detailed error messages

## API Documentation

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGc..."
  }
}
```

**Error Response (409)**:
```json
{
  "success": false,
  "message": "Username already exists"
}
```

### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",  // username OR email
  "password": "password123"
}
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGc..."
  }
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <token>
```

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  }
}
```

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
node database/initDb.js  # Initialize database
npm start  # Start server on port 3000
```

### Frontend Setup
```bash
cd SharelystApp
npm install
npx expo start
```

### Configuration

**Backend**: Update JWT secret in `backend/routes/auth.js`:
```javascript
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
```

**Frontend**: Update API URL in `SharelystApp/contexts/AuthContext.tsx`:
```typescript
const API_BASE_URL = "http://localhost:3000/api";  // Change for production
```

## Testing the System

### 1. Start Backend Server
```bash
cd backend
npm start
```

### 2. Start Frontend App
```bash
cd SharelystApp
npx expo start
```

### 3. Test Registration
- Open the app (will show login screen)
- Click "Register"
- Fill in all fields
- Submit registration
- Should automatically log in and show main app

### 4. Test Login
- Log out from the Explore tab
- Enter username/email and password
- Click "Login"
- Should redirect to main app

### 5. Test Protected Routes
- Try to access main app without logging in
- Should automatically redirect to login screen

## File Structure

```
backend/
├── routes/
│   └── auth.js           # Authentication endpoints
├── database/
│   └── initDb.js         # Database initialization
├── index.js              # Express server setup
└── database.db           # SQLite database

SharelystApp/
├── contexts/
│   └── AuthContext.tsx   # Auth state management
├── app/
│   ├── _layout.tsx       # Root layout with auth protection
│   ├── login.tsx         # Login screen
│   ├── register.tsx      # Registration screen
│   └── (tabs)/
│       └── explore.tsx   # Example protected screen with logout
```

## Authentication Flow

1. **App Launch**:
   - Check for stored JWT token
   - Verify token with backend
   - Redirect to login if invalid/missing
   - Load main app if valid

2. **Registration**:
   - Validate input fields
   - Send to backend
   - Backend checks uniqueness
   - Hash password with bcrypt
   - Insert into database
   - Return JWT token
   - Store token securely
   - Redirect to main app

3. **Login**:
   - Accept username OR email
   - Send credentials to backend
   - Backend queries user
   - Verify password with bcrypt
   - Return JWT token
   - Store token securely
   - Redirect to main app

4. **Logout**:
   - Remove stored token
   - Clear auth state
   - Redirect to login screen

## Troubleshooting

### Backend Issues
- **Port 3000 already in use**: Change PORT in `backend/index.js`
- **Database errors**: Delete `database.db` and run `initDb.js` again
- **CORS errors**: Ensure CORS is enabled in `backend/index.js`

### Frontend Issues
- **Can't connect to backend**: Update API_BASE_URL to your computer's IP
  - For iOS simulator: `http://localhost:3000/api`
  - For Android emulator: `http://10.0.2.2:3000/api`
  - For physical device: `http://YOUR_IP:3000/api`
- **Token storage errors**: Clear app data and reinstall

## Production Considerations

1. **Environment Variables**: Use `.env` files for secrets
2. **HTTPS**: Use HTTPS in production
3. **Token Refresh**: Implement refresh token mechanism
4. **Rate Limiting**: Add rate limiting to auth endpoints
5. **Logging**: Implement proper error logging
6. **Validation**: Add more comprehensive input validation
7. **Password Reset**: Implement forgot password flow
8. **Email Verification**: Add email verification for new accounts

## Next Steps

- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add refresh token mechanism
- [ ] Add rate limiting
- [ ] Implement remember me functionality
- [ ] Add social login (Google, Facebook, etc.)
- [ ] Add multi-factor authentication
- [ ] Implement session management
