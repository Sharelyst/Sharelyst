# Sharelyst - Mobile Application

Sharelyst is a React Native (Expo) mobile app with a Node.js/Express backend for group expense tracking, transactions, and bill splitting.

## Repository Layout

- `backend/` - Express API + SQLite database (Render hosted or local)
- `SharelystApp/` - Expo React Native app (TypeScript, expo-router, NativeWind)
- `README.md` - This document
- `run.ps1` - Launches frontend against Render (deployment mode)
- `fullrun.ps1` - Launches backend + frontend locally (development mode)

## Quick Start

### Option A: Use Render-hosted backend (fastest)

1. Ensure the backend is awake:
   - Visit `https://sharelystbackend.onrender.com/` until it returns `{ "success": true, ... }`.
2. Start the frontend:
   ```bash
   cd SharelystApp
   npx expo start
   ```

### Option B: Run everything locally

1. Backend:
   ```bash
   cd backend
   npm install
   npm run init:db
   npm run dev
   ```
2. Frontend:
   ```bash
   cd SharelystApp
   npm install
   npx expo start
   ```

### PowerShell helpers

- `run.ps1` (frontend only, deployment mode):
  - Sets `EXPO_PUBLIC_ENV=deployment`
  - Installs frontend dependencies
  - Starts Expo with cache cleared
- `fullrun.ps1` (backend + frontend, dev mode):
  - Opens two PowerShell terminals
  - Backend: `npm install`, `npm run dev`
  - Frontend: `npm install`, `npx expo start`

## Tech Stack

### Frontend (`SharelystApp/`)
- React Native + Expo
- TypeScript
- expo-router (file-based routing)
- NativeWind (Tailwind for RN)
- axios (HTTP)
- expo-secure-store (secure token storage)
- lucide-react-native, Expo icons

### Backend (`backend/`)
- Node.js + Express
- SQLite3
- JWT auth (jsonwebtoken)
- bcrypt password hashing
- CORS + dotenv

## Environment Variables

### Frontend
- `EXPO_PUBLIC_ENV`
  - `deployment`: uses Render URL
  - default: uses Render URL (same today)

### Backend (`backend/.env`)
```
NODE_ENV=development
PORT=3000
HOST=0.0.0.0
JWT_SECRET=your-secret
JWT_EXPIRATION=7d
DB_PATH=./database.db
BCRYPT_SALT_ROUNDS=10
CORS_ORIGIN=*
```

## Backend Details

### Entry point (`backend/index.js`)
- Loads config and env.
- Sets up CORS, JSON parsing, and request logging.
- Opens SQLite connection and stores it in `app.set('db')`.
- Routes:
  - `/api/auth`
  - `/api/groups`
  - `/api/transactions`
- Health endpoints:
  - `GET /` returns service status
  - `GET /health` returns health payload
- Global error handling and 404 handling.

### Middleware
- `backend/middleware/auth.js`
  - `authenticateToken`: verifies JWT and attaches `req.user`.
  - `optionalAuth`: best-effort auth without failing.
- `backend/middleware/errorHandler.js`
  - `ApiError` class
  - `errorHandler` for consistent error JSON
  - `asyncHandler` wrapper for async routes
- `backend/middleware/validation.js`
  - `validateEmail`, `validatePassword`, `validateRequiredFields`

### Database
- SQLite database file: `backend/database.db`
- Initialization script: `backend/database/initDb.js`
- Schema reference: `backend/database/schema.sql` (PostgreSQL/MySQL compatible)
- Tables:
  - `users`: profile fields + `group_id`
  - `groups`: 6-digit `group_number`
  - `transactions`: expenses per group
  - `payments`: per-user payments per transaction
- Indexes for frequent lookups.
- Foreign key relationships and cascading rules.

### Database Utility Scripts
- `backend/database/createTestUser.js`:
  - Creates or updates a test user (`test@test.com` / `password123`).
- `backend/database/updatePassword.js`:
  - CLI to update password for an email.
- `backend/database/models.js`:
  - Model classes for User, Group, Transaction, Payment (not currently used by routes).
- `backend/database/queries.js`:
  - Query helpers (Postgres-style placeholders). Not used by current SQLite routes.

### Backend Deployment
- Render configuration in `backend/render.yaml`.
- `buildCommand`: `npm install && npm run init:db`
- `startCommand`: `npm start`
- Health check: `/health`

## API Reference

Base URL:
- Render: `https://sharelystbackend.onrender.com/api`
- Local: `http://localhost:3000/api`

### Auth (`/api/auth`)
- `POST /register`
  - Body: `username`, `firstName`, `lastName`, `email`, `phone?`, `password`, `confirmPassword`
  - Returns: user info + JWT
- `POST /login`
  - Body: `identifier` (username or email), `password`
  - Returns: user info + JWT
- `POST /verify`
  - Header: `Authorization: Bearer <token>`
  - Returns: token validity + user data
- `GET /me`
  - Header: `Authorization: Bearer <token>`
  - Returns: user profile
- `PUT /profile`
  - Header: `Authorization: Bearer <token>`
  - Body: any of `firstName`, `lastName`, `email`, `phone`, `username`
  - Returns: updated profile
- `GET /ping`
  - Used by frontend for connectivity status

### Groups (`/api/groups`)
- `POST /create`
  - Header: `Authorization: Bearer <token>`
  - Body: `name`, `description?`
  - Returns: group info + 6-digit group code
- `POST /join`
  - Header: `Authorization: Bearer <token>`
  - Body: `groupCode` (6-digit number)
- `GET /my-group`
  - Header: `Authorization: Bearer <token>`
  - Returns: group info + members or `null` if none
- `POST /leave`
  - Header: `Authorization: Bearer <token>`
  - Removes user from group and deletes group if empty

### Transactions (`/api/transactions`)
- `POST /create`
  - Header: `Authorization: Bearer <token>`
  - Body:
    - `name`, `total`, `split` (boolean), `payments` array
    - `payments` items: `{ user_id, amount }`
- `GET /my-group`
  - Header: `Authorization: Bearer <token>`
  - Returns: all group transactions with payment details
- `GET /total`
  - Header: `Authorization: Bearer <token>`
  - Returns: total amount of all group transactions
- `GET /splitBills`
  - Header: `Authorization: Bearer <token>`
  - Returns: per-person totals + settlement plan
- `POST /settleBills`
  - Header: `Authorization: Bearer <token>`
  - Body: `{ action: "reset" | "delete" }`
- `GET /user-spendings`
  - Header: `Authorization: Bearer <token>`
  - Returns: total spent per user
- `GET /:id`
  - Header: `Authorization: Bearer <token>`
  - Returns: transaction details with payments

## Frontend Details

### App Entry and Providers
- `SharelystApp/app/_layout.tsx`:
  - Wraps the app in `AuthProvider` and `ConnectionStatusProvider`.
  - Controls authentication-based routing.
  - Shows `ConnectionStatus` indicator.

### Auth Context
- `SharelystApp/contexts/AuthContext.tsx`:
  - Stores token in `expo-secure-store` under `auth_token`.
  - Verifies token at startup with `/auth/verify`.
  - Supports login/register/logout.
  - Stores navigation preference (`navbar` or `hamburger`).
  - Uses fallback API URLs if the primary API fails.

### Connection Status
- `SharelystApp/contexts/ConnectionStatusContext.tsx` + `components/ConnectionStatus.tsx`:
  - Pings `/auth/ping` every 5 seconds.
  - Displays green/red dot based on connectivity.

### Navigation Structure (expo-router)

- Auth flow:
  - `app/login.tsx`
  - `app/register.tsx`
- Group setup flow:
  - `app/groupchoice.tsx` (decides create vs join)
  - `app/creategroup.tsx` (creates group and shows code)
  - `app/findgroup.tsx` + `app/CodeInput.tsx` (join group)
- Main tabs (`app/(tabs)/_layout.tsx`):
  - `maingroup.tsx` (home dashboard)
  - `activities.tsx` (all transactions)
  - `people.tsx` (group members)
  - `profile.tsx` (profile, settings, group actions)
- Additional screens:
  - `app/addactivity.tsx` (create transaction)
  - `app/activitydetails.tsx` (transaction detail)
  - `app/persondetails.tsx` (member spending breakdown)
  - `app/split-bill.tsx` (bill split summary + settle actions)
  - `app/modal.tsx` (template modal)
  - `app/index.tsx` (default Expo starter screen)

### Key Screen Behavior
- `maingroup.tsx`
  - Fetches group info, total spend, recent activities, and spendings.
  - Shows group members and shortcuts to People/Activities.
- `activities.tsx`
  - Lists all transactions and links to details.
- `people.tsx`
  - Lists group members and their total spent.
- `profile.tsx`
  - Editable profile fields.
  - Navigation style toggle (navbar vs hamburger).
  - Group code display and leave group action.

### Styling and UI
- NativeWind setup:
  - `tailwind.config.js` + `app/globals.css`
  - `babel.config.js` sets `nativewind` preset
  - `metro.config.js` wired with `withNativeWind`
- Theme helpers:
  - `constants/theme.ts` (colors and fonts)
  - `hooks/use-theme-color.ts` + `use-color-scheme.ts`
- Shared UI components:
  - `components/haptic-tab.tsx`
  - `components/themed-text.tsx`, `components/themed-view.tsx`
  - `components/parallax-scroll-view.tsx` (Expo template)
  - `components/external-link.tsx`

### API Configuration
- `SharelystApp/config/api.ts`:
  - Primary URL: Render backend
  - Fallbacks: common local IPs and emulator address

## Assets

Images in `SharelystApp/assets/images/`:
- App icons: `icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`
- Splash screen: `splash-icon.png`
- Web favicon: `favicon.png`
- UI gradients: `gradient-1.png` through `gradient-6.png`
- UI icons: `homeIcon.png`, `bookIcon.png`, `peopleIcon.png`, `profileIcon.png`, `arrow_back.png`, `track.png`
- Expo template assets: `react-logo.png`, `react-logo@2x.png`, `react-logo@3x.png`, `partial-react-logo.png`

## Development Notes

- The backend uses SQLite; `initDb.js` builds the schema if needed.
- In production, set a strong `JWT_SECRET` and restrict `CORS_ORIGIN`.
- The frontend is designed to work even when the backend cold-starts; use `/auth/ping` to confirm readiness.
- There are no automated tests configured in this repository.

## Troubleshooting

- Backend cold start (Render): visit `https://sharelystbackend.onrender.com/` until it responds.
- App cannot connect:
  - Check backend status.
  - Confirm `API_URL` and fallbacks in `SharelystApp/config/api.ts`.
- Expo cache issues:
  - Run `npx expo start --clear` after installing packages.

## Team

- Yuriy Kotyashko
- Stefewn Johnson
- Muhammad Zamin
- Daniel Chahine
