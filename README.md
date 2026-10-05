# 🎮 Telegram Mini App: Secure Authentication & User System (Phase 1)

> **Phase 1 Complete**: Mobile-first Telegram Mini App featuring cryptographic server-side authentication, MongoDB user persistence, and secure HTTP-only session cookies.

---

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Prerequisites & Requirements](#prerequisites--requirements)
5. [Database Setup (MongoDB)](#database-setup-mongodb)
6. [Telegram Bot Setup (@BotFather)](#telegram-bot-setup-botfather)
7. [Environment Variables](#environment-variables)
8. [Installation](#installation)
9. [Running the Application](#running-the-application)
10. [Building for Production](#building-for-production)
11. [Authentication Flow](#authentication-flow)
12. [Security Architecture](#security-architecture)
13. [API Endpoints Reference](#api-endpoints-reference)
14. [Running Tests](#running-tests)
15. [Project Structure](#project-structure)

---

## 1. Project Overview

This repository contains **Phase 1** of the gamified rewards platform built natively for **Telegram Mini Apps**.

### Focus of Phase 1:
- Cryptographic server-side Telegram Mini App authentication using official HMAC-SHA256 standards.
- Database-backed user lifecycle management (find or create user without duplicates).
- Secure, session-based authentication using HTTP-only signed cookies.
- Polished, mobile-first Next.js UI tailored for 390px mobile screens, matching native Telegram design aesthetics and theme variables.
- Zero financial or gamification features yet (VIP, rewards, balance, and tasks are strictly deferred to future phases).

---

## 2. Architecture

```text
Telegram Client (Mobile / Desktop)
        │
        ▼ (initData via WebApp SDK)
Next.js 15 Mini App (React + Tailwind CSS)
        │
        ▼ (POST /api/auth/telegram with credentials: 'include')
Express.js REST API (Node.js + TypeScript)
        │
        ├─► Timing-Safe HMAC-SHA256 Signature Verification
        ├─► auth_date Expiration Check (24h Window)
        ├─► Session Creation (crypto.randomBytes)
        │
        ▼
MongoDB (Mongoose ODM)
        ├── Users Collection (unique indexed telegramId)
        └── Sessions Collection (indexed sessionId + TTL auto-expiration)
```

### Architectural Principles:
- **Routes → Controllers → Services → Models**: Separation of concerns throughout the backend.
- **Never Trust the Client**: Frontend user metadata is ignored; user records are created strictly from backend-verified Telegram cryptographic signatures.
- **Zero Bot Token Leakage**: The bot token is stored strictly in backend environment variables and is never transmitted to the frontend or included in API responses.
- **Stateless HTTP-only Cookies**: Authentication state is maintained using HTTP-only signed cookies, completely immune to JavaScript XSS theft (no localStorage token storage).

---

## 3. Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | [Next.js 15](https://nextjs.org/) (App Router) | React Server & Client Components |
| **Frontend Styling** | [Tailwind CSS](https://tailwindcss.com/) | Mobile-first 390px, Telegram CSS variables, violet theme |
| **Telegram SDK** | [Telegram WebApp SDK](https://core.telegram.org/bots/webapps) | Native viewport, theme detection, and haptic feedback |
| **Backend** | [Express.js](https://expressjs.com/) (Node.js) | Structured REST API in TypeScript |
| **Database** | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) | Persistent document storage with strict schemas & TTL |
| **Validation** | [Zod](https://zod.dev/) | Runtime request body schema validation |
| **Security** | `helmet`, `cookie-parser`, `express-rate-limit` | Defensive headers, signed cookies, and brute-force protection |
| **Testing** | [Jest](https://jestjs.io/) + [Supertest](https://github.com/ladjs/supertest) | Integration tests with in-memory MongoDB |

---

## 4. Prerequisites & Requirements

- **Node.js**: v18.0.0 or later (v20+ / v22+ / v24+ recommended)
- **npm**: v9.0.0 or later
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster.
- **Telegram Account**: To create and configure a bot via `@BotFather`.

---

## 5. Database Setup (MongoDB)

### Local MongoDB:
Start your local MongoDB service:
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod

# Windows
net start MongoDB
```

### MongoDB Atlas (Cloud):
1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Obtain your connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/telegram_rewards?retryWrites=true&w=majority`.
3. Set `MONGODB_URI` in `server/.env`.

---

## 6. Telegram Bot Setup (@BotFather)

1. Open Telegram and search for `@BotFather`.
2. Send `/newbot` and follow the prompts to choose a bot name and username.
3. Copy the HTTP API token provided by BotFather (e.g. `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`).
4. Set up your Web App button:
   - Send `/newapp` to `@BotFather`.
   - Select your bot.
   - Enter your App Title and Description.
   - Upload an app photo (640x360).
   - Enter your Web App URL (e.g. your local tunnel or production domain: `https://your-domain.com` or `https://xxxx.ngrok-free.app`).
   - Enter a short name for the app.
5. In development, you can use [ngrok](https://ngrok.com/) or [localtunnel](https://localtunnel.me/) to tunnel port 3000 to an HTTPS URL for Telegram testing.

---

## 7. Environment Variables

### Backend Configuration (`server/.env`):
Create `server/.env` from the provided `server/.env.example`:

```env
# Runtime environment ('development' | 'production' | 'test')
NODE_ENV=development

# Server port
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/telegram_rewards

# Telegram Bot Token from @BotFather (NEVER share or expose this)
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Cryptographic Session Secret (minimum 32 characters)
SESSION_SECRET=super_secret_session_key_at_least_32_chars_long

# Allowed Frontend URL for CORS & Cookie Origin
FRONTEND_URL=http://localhost:3000

# Maximum authentication attempts per minute per IP
AUTH_RATE_LIMIT=10
```

### Frontend Configuration (`client/.env.local`):
Create `client/.env.local` from the provided `client/.env.example`:

```env
# Backend Express API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 8. Installation

From the project root:

```bash
# Install root orchestration dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Install frontend dependencies
cd client
npm install
cd ..
```

---

## 9. Running the Application

### Development Mode (Concurrent):
Run both the frontend and backend simultaneously from the root directory:
```bash
npm run dev
```

### Or run individually:

**Backend (Port 5000):**
```bash
npm run dev:server
# or: cd server && npm run dev
```

**Frontend (Port 3000):**
```bash
npm run dev:client
# or: cd client && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser:
- When accessed directly in a standard browser outside Telegram, the app displays the **📱 Open in Telegram** screen.
- When accessed inside the Telegram Mini App environment, the app automatically verifies `initData` and signs you in.

---

## 10. Building for Production

```bash
# Build both frontend and backend
npm run build

# Start backend in production
cd server
npm run start

# Start frontend in production
cd client
npm run start
```

---

## 11. Authentication Flow

```text
1. User taps "Open App" in Telegram
2. Telegram WebApp loads Next.js app in secure WebView
3. Next.js app calls window.Telegram.WebApp.ready() & expand()
4. Next.js retrieves `window.Telegram.WebApp.initData`
5. Client makes POST request to `/api/auth/telegram`:
   Body: { "initData": "<raw_init_data_query_string>" }
   Options: credentials: "include"
6. Express Backend verifies initData:
   a. Extracts 'hash' parameter from query string.
   b. Canonicalizes remaining key-value pairs sorted alphabetically.
   c. Computes secret_key = HMAC_SHA256("WebAppData", TELEGRAM_BOT_TOKEN).
   d. Computes expected_hash = HMAC_SHA256(secret_key, canonical_string).
   e. Performs constant-time comparison via crypto.timingSafeEqual.
   f. Verifies that auth_date is within valid time window (24h).
   g. Parses trusted user payload.
7. MongoDB Lookup & Upsert:
   a. Queries User collection by unique telegramId.
   b. Creates new User if first time; updates profile if existing.
8. Session Establishment:
   a. Generates 64-char crypto session token.
   b. Saves Session document in MongoDB with TTL index.
   c. Sets HTTP-only, Signed Cookie ('tg_session_id') on response.
9. Backend returns sanitized user DTO.
10. Frontend transitions from "Signing you in..." to Home Profile screen.
```

---

## 12. Security Architecture

1. **Server-Side Signature Verification**: Authentication does not trust client parameters. Only the cryptographically signed `initData` string verified against the bot token is accepted.
2. **Timing-Attack Resistance**: Hex signatures are compared using Node.js `crypto.timingSafeEqual` to eliminate timing side-channel leakage.
3. **Replay & Expiration Protection**: `auth_date` is checked against a maximum age (default: 24 hours), and timestamps in the future (>60s) are rejected.
4. **HTTP-Only Signed Cookies**:
   - `httpOnly: true`: JavaScript cannot read or extract the session identifier.
   - `signed: true`: Signed with `SESSION_SECRET` via `cookie-parser`.
   - `secure: true` in production (HTTPS).
   - `sameSite`: Configured for iframe compatibility inside Telegram webviews.
5. **Rate Limiting**: `express-rate-limit` throttles auth attempts (10/min per IP) to prevent brute-force attacks.
6. **Input Validation**: Zod schemas reject missing, blank, or malformed payloads.
7. **Strict CORS**: Express rejects requests from unauthorized origins; credentials are enabled only for `FRONTEND_URL`.
8. **No Secret Leakage**: Stack traces, bot tokens, and database connection strings are never exposed in client responses.

---

## 13. API Endpoints Reference

### `POST /api/auth/telegram`
Verifies Telegram Mini App initialization data, creates or updates the user, and sets the session cookie.

- **Rate Limit**: 10 requests / minute
- **Request Body**:
  ```json
  {
    "initData": "query_id=...&user=%7B%22id%22%3A123456%2C...%7D&auth_date=1700000000&hash=..."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "6702c2e0f498c0b1a23e8901",
      "telegramId": "123456789",
      "username": "amanuel_dev",
      "firstName": "Amanuel",
      "lastName": "Developer",
      "avatarUrl": "https://t.me/i/userpic/320/photo.jpg",
      "status": "ACTIVE"
    }
  }
  ```
- **Response Headers**:
  `Set-Cookie: tg_session_id=s%3A...; Path=/; HttpOnly; SameSite=Lax`

---

### `GET /api/auth/me`
Retrieves the profile of the currently authenticated user based on the session cookie.

- **Requires Authentication**: Yes (`requireAuth` middleware)
- **Response `200 OK`**:
  ```json
  {
    "user": {
      "id": "6702c2e0f498c0b1a23e8901",
      "telegramId": "123456789",
      "username": "amanuel_dev",
      "firstName": "Amanuel",
      "lastName": "Developer",
      "avatarUrl": "https://t.me/i/userpic/320/photo.jpg",
      "status": "ACTIVE"
    }
  }
  ```
- **Response `401 Unauthorized`**:
  ```json
  {
    "error": "UnauthorizedError",
    "message": "Authentication required"
  }
  ```

---

### `POST /api/auth/logout`
Destroys the session in MongoDB and clears the HTTP-only cookie.

- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### `GET /api/health`
Health check endpoint reporting API status.

- **Response `200 OK`**:
  ```json
  {
    "status": "ok",
    "timestamp": "2026-10-05T18:00:00.000Z",
    "service": "telegram-rewards-api"
  }
  ```

---

## 14. Running Tests

The backend includes a comprehensive automated test suite covering all 14 Phase 1 criteria using **Jest**, **Supertest**, and an in-memory MongoDB server:

```bash
npm run test
# or: cd server && npm test
```

### Verified Test Cases:
1. Valid Telegram initData succeeds and creates user.
2. Invalid initData hash signature is rejected (HTTP 401).
3. Tampered initData is rejected (HTTP 401).
4. Expired authentication data is rejected (HTTP 401).
5. Future auth_date is rejected (HTTP 401).
6. New Telegram user creates exactly one MongoDB document.
7. Existing Telegram user is recognized and updated.
8. Repeated authentication prevents duplicate users.
9. Authenticated `GET /api/auth/me` returns the correct user.
10. Unauthenticated `GET /api/auth/me` returns HTTP 401.
11. `POST /api/auth/logout` destroys session in DB and clears cookie.
12. Protected endpoints reject requests with expired/missing sessions.
13. Rate limiter triggers HTTP 429 when threshold is exceeded.
14. Invalid request bodies (missing initData) return HTTP 400.
15. Telegram bot token is never included in API responses.

---

## 15. Project Structure

```text
telegram-mini-app/
├── client/                              # Next.js 15 App Router Frontend
│   ├── app/
│   │   ├── globals.css                  # Telegram theme vars & mobile styles
│   │   ├── layout.tsx                   # Telegram WebApp script loader
│   │   └── page.tsx                     # State-driven home view
│   ├── components/
│   │   ├── AuthError.tsx                # Polished auth failure UI
│   │   ├── AuthLoading.tsx              # Glowing "Signing you in..." screen
│   │   ├── NonTelegramAccess.tsx        # "Open in Telegram" external screen
│   │   └── UserProfile.tsx              # Authenticated user card & logout
│   ├── hooks/
│   │   └── useAuth.tsx                  # React Context & auth state hook
│   ├── lib/
│   │   ├── api.ts                       # Fetch wrapper with credentials:include
│   │   └── telegram.ts                  # WebApp SDK helpers & haptic feedback
│   ├── services/
│   │   └── auth.service.ts              # Frontend API service
│   ├── types/
│   │   ├── auth.ts                      # User & auth state types
│   │   └── telegram.ts                  # Telegram WebApp SDK type definitions
│   ├── .env.example
│   ├── next.config.ts
│   ├── package.json
│   ├── postcss.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── server/                              # Express.js REST API
│   ├── src/
│   │   ├── __tests__/                   # Jest automated test suite
│   │   │   ├── auth.integration.test.ts # Full integration tests
│   │   │   ├── rateLimiter.test.ts      # Rate limiter tests
│   │   │   └── telegram.service.test.ts # Cryptographic unit tests
│   │   ├── config/
│   │   │   ├── database.ts              # MongoDB Mongoose connection
│   │   │   └── env.ts                   # Zod-validated environment config
│   │   ├── controllers/
│   │   │   └── auth.controller.ts       # Auth HTTP handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts       # requireAuth session validator
│   │   │   ├── error.middleware.ts      # Centralized error handler
│   │   │   ├── rateLimiter.middleware.ts# 10 req/min rate limiter
│   │   │   └── validate.middleware.ts   # Zod request body validator
│   │   ├── models/
│   │   │   ├── session.model.ts         # Session schema with TTL index
│   │   │   └── user.model.ts            # User schema with unique telegramId
│   │   ├── routes/
│   │   │   ├── auth.routes.ts           # /api/auth routes
│   │   │   └── index.ts                 # Master router
│   │   ├── services/
│   │   │   ├── auth.service.ts          # Auth business logic
│   │   │   ├── session.service.ts       # Session management logic
│   │   │   └── telegram.service.ts      # Official HMAC verification
│   │   ├── types/
│   │   │   └── auth.types.ts            # Server data transfer types
│   │   ├── utils/
│   │   │   ├── crypto.ts                # Timing-safe HMAC algorithms
│   │   │   └── errors.ts                # AppError HTTP classes
│   │   ├── app.ts                       # Express app configuration
│   │   └── server.ts                    # Entrypoint & graceful shutdown
│   ├── .env.example
│   ├── jest.config.ts
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                           # Git ignore rules protecting secrets
├── package.json                         # Root monorepo workspace configuration
├── vercel.json                          # Vercel serverless routing configuration
└── README.md                            # Comprehensive documentation
```

---

## 16. Deploying on Vercel (Unified Deployment)

This repository is configured for unified deployment on [Vercel](https://vercel.com), running the **Next.js frontend** and the **Express backend** (as a Serverless Function) under the exact same domain. This eliminates cross-origin cookie restrictions and CORS hurdles inside Telegram WebViews.

### Step 1: Push to GitHub
Your repository is live at:
[https://github.com/AmanuelCrafts/telegram-mini-app](https://github.com/AmanuelCrafts/telegram-mini-app)

### Step 2: Import into Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
2. Select your GitHub repository: `AmanuelCrafts/telegram-mini-app`.
3. Configure Project Settings:
   - **Framework Preset**: Next.js (or Other / auto-detected)
   - **Root Directory**: `./` (leave as repository root)
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`

### Step 3: Add Production Environment Variables in Vercel
In the Vercel project configuration, add the following under **Environment Variables**:

| Variable Name | Value | Purpose |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/telegram_rewards` | MongoDB Atlas database connection |
| `TELEGRAM_BOT_TOKEN` | `1234567890:ABC...` | From @BotFather for HMAC validation |
| `SESSION_SECRET` | *(Random 32+ chars)* | For signing HTTP-only session cookies |
| `NODE_ENV` | `production` | Enables secure cookies & production optimizations |
| `AUTH_RATE_LIMIT` | `10` | Brute force rate limiter |

*(Note: `NEXT_PUBLIC_API_URL` can be left blank in production on Vercel so the frontend automatically communicates with `/api` on the same domain).*

### Step 4: Deploy & Connect to Telegram
1. Click **Deploy**.
2. Once the build finishes, copy your Vercel deployment domain (e.g. `https://telegram-mini-app.vercel.app`).
3. Open Telegram → `@BotFather` → `/mybots` → Select your bot → **Bot Settings** → **Menu Button** (or `/newapp` Web App URL) → paste your Vercel HTTPS URL.
4. Launch your bot in Telegram and test your seamless authentication!

