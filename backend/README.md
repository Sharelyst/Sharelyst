# Sharelyst Backend API

Production-ready backend API for the Sharelyst application built with Express.js, SQLite, and JWT authentication.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing
- 🌍 **Environment Configuration** - Separate configs for development and production
- 🛡️ **Error Handling** - Centralized error handling with custom API errors
- 🔒 **Security Middleware** - Authentication and validation middleware
- 📊 **Database** - SQLite with proper indexing and schema
- 🚀 **Production Ready** - Configured for deployment on Render/Railway/Heroku

## Tech Stack

- **Runtime**: Node.js 16+
- **Framework**: Express.js 5.x
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken) + bcrypt
- **Environment**: dotenv

## Project Structure

```
backend/
├── config/
│   └── index.js          # Environment configuration
├── database/
│   └── initDb.js         # Database initialization script
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   └── validation.js     # Validation helpers
├── routes/
│   └── auth.js           # Authentication routes
├── .env.example          # Example environment variables
├── .env.development      # Development environment config
├── .gitignore            # Git ignore rules
├── index.js              # Application entry point
├── package.json          # Dependencies and scripts
└── render.yaml           # Render deployment config
```

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 8.x or higher

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Copy the development environment file
cp .env.development .env

# Edit .env with your configuration
# Make sure to change JWT_SECRET to a strong secret key
```

4. Initialize the database:
```bash
npm run init:db
```

### Running the Application

#### Development Mode
```bash
npm run dev
```
This runs the server with nodemon for auto-reload on file changes.

#### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000` by default.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Environment
NODE_ENV=development

# Server Configuration
PORT=3000
HOST=0.0.0.0

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=7d

# Database Configuration
DB_PATH=./database.db

# Security
BCRYPT_SALT_ROUNDS=10

# CORS Configuration
CORS_ORIGIN=*
```

### Environment Variables Explanation

- `NODE_ENV`: Application environment (development/production)
- `PORT`: Server port
- `HOST`: Server host (0.0.0.0 for all interfaces)
- `JWT_SECRET`: Secret key for JWT token signing (MUST be changed in production)
- `JWT_EXPIRATION`: JWT token expiration time
- `DB_PATH`: SQLite database file path
- `BCRYPT_SALT_ROUNDS`: Number of salt rounds for bcrypt
- `CORS_ORIGIN`: CORS allowed origins (* for all, or specific URLs)

## API Endpoints

### Health Check

#### GET /
Returns API status and version.

#### GET /health
Health check endpoint for monitoring.

### Authentication

#### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
Login with username/email and password.

**Request Body:**
```json
{
  "identifier": "johndoe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/verify
Verify JWT token validity.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
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

#### GET /api/auth/me
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2024-11-21T10:30:00.000Z"
  }
}
```

## Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "stack": "Error stack trace (only in development)"
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `409` - Conflict (duplicate username/email)
- `500` - Internal Server Error

## Deployment

### Render

The project includes a `render.yaml` file for easy deployment on Render.

1. Push your code to GitHub
2. Connect your repository to Render
3. Render will automatically detect the configuration
4. Set your environment variables in the Render dashboard
5. Deploy!

### Other Platforms

For Railway, Heroku, or other platforms:

1. Ensure `NODE_ENV=production` is set
2. Set a strong `JWT_SECRET`
3. Configure other environment variables as needed
4. The app will run on the PORT provided by the platform

## Security Considerations

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random secret
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` to specific domains (not *)
- [ ] Use HTTPS in production
- [ ] Set up proper database backups
- [ ] Enable rate limiting (future enhancement)
- [ ] Monitor logs and errors
- [ ] Keep dependencies updated

## Database

The application uses SQLite for simplicity. The database file is created automatically when running `npm run init:db`.

### Schema

**Users Table:**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Code Structure

- **config/**: Centralized configuration management
- **middleware/**: Reusable middleware functions
- **routes/**: API route handlers
- **database/**: Database initialization and migrations

### Adding New Routes

1. Create a new route file in `routes/`
2. Import required middleware
3. Use `asyncHandler` wrapper for async routes
4. Import and register in `index.js`

Example:
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');

router.get('/protected', authenticateToken, asyncHandler(async (req, res) => {
  // Your logic here
}));
```

## License

ISC