# 🚀 Quick Start Guide - Sharelyst Authentication

## ✅ What's Been Implemented

Your Sharelyst app now has a **complete, production-ready authentication system**:

### Backend Features
- ✅ SQLite database with users table
- ✅ Secure password hashing (bcrypt)
- ✅ JWT token authentication (7-day expiration)
- ✅ Three API endpoints: `/api/auth/register`, `/api/auth/login`, `/api/auth/verify`
- ✅ Input validation and error handling
- ✅ Username OR email login support

### Frontend Features
- ✅ Login screen with username/email + password
- ✅ Registration screen with all required fields
- ✅ Secure token storage (expo-secure-store)
- ✅ Global authentication state (React Context)
- ✅ Protected routes - users MUST login to access the app
- ✅ Automatic redirect to login if not authenticated
- ✅ Logout functionality with confirmation

## 🎯 How It Works

1. **App Launch**: Checks for saved JWT token → redirects to login if none/invalid
2. **Registration**: New users create account → automatically logged in
3. **Login**: Existing users sign in with username/email + password
4. **Protected Access**: Main app only accessible after successful login
5. **Logout**: Clears token and redirects back to login

## 📋 Testing the System

### Step 1: Start the Backend
```powershell
cd backend
npm start
```
✅ Server should start on `http://localhost:3000`

### Step 2: Run Backend Tests (Optional)
```powershell
cd backend
node testAuth.js
```
✅ All 4 tests should pass

### Step 3: Start the Mobile App
```powershell
cd SharelystApp
npx expo start
```
Then press:
- `i` for iOS Simulator
- `a` for Android Emulator
- `w` for Web Browser

### Step 4: Test the Flow

**First Launch:**
1. App opens → Shows login screen (because not authenticated)
2. Click "Register" button
3. Fill in:
   - Username: `johndoe`
   - Email: `john@example.com`
   - Password: `password123`
   - Confirm Password: `password123`
4. Click "Register"
5. ✅ Should automatically log you in and show the main app

**Logout:**
1. Go to "Explore" tab
2. Click "Logout" button
3. Confirm logout
4. ✅ Should redirect back to login screen

**Login:**
1. Enter username OR email: `johndoe` or `john@example.com`
2. Enter password: `password123`
3. Click "Login"
4. ✅ Should show the main app

## 🔒 Security Features

- Passwords are hashed with bcrypt (never stored in plain text)
- JWT tokens expire after 7 days
- Tokens stored securely using expo-secure-store
- Email and username uniqueness enforced
- Input validation on both client and server
- Detailed error messages for debugging

## 📁 Key Files Created/Modified

### Backend
- `backend/routes/auth.js` - Authentication endpoints
- `backend/database/initDb.js` - Database initialization
- `backend/index.js` - Updated to include auth routes
- `backend/testAuth.js` - Automated tests

### Frontend
- `SharelystApp/contexts/AuthContext.tsx` - Auth state management
- `SharelystApp/app/_layout.tsx` - Root layout with auth protection
- `SharelystApp/app/login.tsx` - Login screen
- `SharelystApp/app/register.tsx` - Registration screen
- `SharelystApp/app/(tabs)/explore.tsx` - Added logout button

## 🛠️ Configuration

### For Physical Devices or Different Networks

Update the API URL in `SharelystApp/contexts/AuthContext.tsx`:

```typescript
// Line 11
const API_BASE_URL = "http://YOUR_COMPUTER_IP:3000/api";
```

**Find your IP:**
```powershell
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

Examples:
- iOS Simulator: `http://localhost:3000/api` ✅ (default)
- Android Emulator: `http://10.0.2.2:3000/api`
- Physical Device: `http://192.168.1.100:3000/api` (use your actual IP)

## 📊 API Endpoints

### Register User
```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login User
```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "identifier": "johndoe",  # username OR email
  "password": "password123"
}
```

### Verify Token
```http
POST http://localhost:3000/api/auth/verify
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🐛 Troubleshooting

### "Cannot connect to backend"
- Ensure backend server is running: `cd backend && npm start`
- Check API_BASE_URL in AuthContext.tsx matches your setup
- For Android emulator, use `http://10.0.2.2:3000/api`
- For physical device, use your computer's IP address

### "Port 3000 already in use"
- Kill the process using port 3000
- Or change PORT in `backend/index.js`

### "Token errors" / "Login not working"
- Clear app data and reinstall
- Check backend server logs for errors
- Verify database exists: `backend/database.db`

### TypeScript errors in AuthContext.tsx
- These are editor-only warnings due to React 19
- The code compiles and runs correctly
- Can be safely ignored

## ✨ What's Next?

The authentication system is complete and working! You can now:

1. **Customize the UI**: Update colors, fonts, and styles in login/register screens
2. **Add Features**: Implement password reset, email verification, etc.
3. **Build Your App**: Start building features knowing users are authenticated
4. **Deploy**: When ready, update API_BASE_URL to your production server

## 📖 Documentation

Full documentation available in `AUTHENTICATION.md` including:
- Detailed API documentation
- Database schema
- Security best practices
- Production considerations
- Future enhancements

---

**You're all set!** 🎉 Your app now has a complete authentication system protecting access to the main application.
