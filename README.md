# LPU Lost & Found (LPU_LAF)

A cross‑platform Lost & Found system for LPU with:
- Mobile app (Expo + React Native) for students to report and browse items
- Web admin panel for moderators to review and manage reports
- Fast, modern Node.js backend with Fastify, JWT auth, WebSockets, and a SQL database (libSQL/Turso via Drizzle ORM)

---

## Tech Stack

- Mobile (App)
  - Expo 53, React Native 0.79, React 19
  - React Navigation (native/stack/bottom/top tabs)
  - React Query, Zustand (state)
  - React Native Paper, Paper Dates, Vector Icons
  - Axios

- Admin Panel (Web)
  - React 19 + Vite 6
  - MUI 7, CoreUI React
  - React Router 7
  - React Query, Zustand
  - Axios

- Backend (API)
  - Node.js + Fastify 5
  - JWT auth, bcrypt
  - Drizzle ORM + libSQL/Turso (@libsql/client)
  - WebSockets (@fastify/websocket)
  - CORS (@fastify/cors), dotenv
  - Email delivery: Resend

---

## Features

- Account registration with email OTP verification
- Secure login (JWT), change password (OTP confirmation), forgot/reset password (OTP)
- Report lost or found items (users)
- Real‑time notifications via WebSockets
  - Targeted to admins or specific users
- Admin review workflow
  - Approve/reject reports
  - Convert approved reports into public “lost”/“found” listings
  - Manage item status: claimed/found/expired/delete
  - Archive views: claimed/reunited/expired
- Protected listings
  - Found items (available only)
  - Lost items (missing only)

---

## Monorepo Structure

```
.
├─ lostfound-frontend/      # Expo/React Native mobile app
├─ lostfound-admin-panel/   # React + Vite admin panel
└─ lostfound-backend/       # Fastify API + WebSockets (Drizzle ORM + libSQL/Turso)
```

---

## Getting Started

Prerequisites
- Node.js 18+ (LTS recommended) and npm
- Expo Go app (for running on a physical device)
- A reachable backend URL on your LAN for mobile testing

Clone
```
git clone https://github.com/AdeptusCodicus/LPU_Lost-and-Found.git
cd LPU_Lost-and-Found
```

### 1) Backend (API)

Install
```
cd lostfound-backend
npm install
```

Environment (create .env)
```
# Server
PORT=3000
JWT_SECRET=replace_me_with_a_long_random_string

# Database (Turso / libSQL)
TURSO_DATABASE_URL=libsql://<your-db-name>-<org>.turso.io
TURSO_AUTH_TOKEN=<your-turso-auth-token>

# Email (Resend)
RESEND_API_KEY=<your-resend-api-key>
```

Start
```
npm start
```

The API will listen on:
- HTTP: http://0.0.0.0:3000
- WebSocket endpoint: ws://<host>:3000/ws?token=<JWT>

Notes
- Email domain checks are enforced in code. For development, Gmail is temporarily allowed for convenience; remove in production.
- Database tables are managed via Drizzle (see lostfound-backend/db/schema.js).
- The server broadcasts updates over WebSockets to all or specific users/admins.

### 2) Mobile App (Expo + React Native)

Install
```
cd ../lostfound-frontend
npm install
```

Configure API URL
- Set your backend URL (LAN IP recommended) in the app config. If you have a config file like:
  - lostfound-frontend/config/app.ts
  - Example content:
    ```ts
    export const API_URL = "http://192.168.1.123:3000";
    ```
- Ensure the device and your computer are on the same network.

Run
```
npm start
```
- Press w in the Expo CLI to open web
- Scan the QR with the Expo Go app to run on a device

### 3) Admin Panel (React + Vite)

Install
```
cd ../lostfound-admin-panel
npm install
```

Configure API URL
- Create a .env file with:
  ```
  VITE_API_URL=http://192.168.1.123:3000
  ```
Run
```
npm run dev
```

---

## API Overview (high level)

Auth
- POST /auth/register — register (email OTP sent)
- POST /auth/verify-email — verify account with OTP
- POST /auth/login — obtain JWT
- POST /auth/forgot-password — request OTP
- POST /auth/reset-password — confirm reset with OTP
- POST /auth/change-password — start change (OTP confirmation flow)
- POST /auth/confirm-password-change — finalize password change
- POST /auth/change-username — update username
- POST /auth/resend-otp — resend OTP (verification/password flows)

User
- POST /user/report — submit a report (lost/found)
- GET /user/my-reports — view own reports

Public/Protected Listings
- GET /found-items — available found items
- GET /lost-items — missing lost items

Admin
- GET /admin/reports — list all reports
- POST /admin/reports/:id/approve — approve a report (creates item)
- POST /admin/reports/:id/reject — reject a report
- POST /admin/found-items/:id/mark-claimed — mark found item claimed
- POST /admin/lost-items/:id/mark-found — mark lost item reunited/found
- POST /admin/item/:id/mark-expired — mark item expired (lost or found)
- DELETE /admin/item/delete/:id — delete item
- GET /admin/archive?type=claimed|reunited|expired — archived items

WebSockets
- Endpoint: /ws?token=<JWT>
- Broadcasts:
  - NEW_PENDING_REPORT, REPORT_REJECTED, NEW_ITEM_APPROVED, FOUND_ITEM_STATUS_UPDATED, LOST_ITEM_STATUS_UPDATED, FOUND_ITEM_DELETED, LOST_ITEM_DELETED, etc.
  - Targeted notifications for specific user emails and admins are supported.

---

## Development Tips

- Use your machine’s LAN IP for API URLs so mobile devices can reach the backend.
- Keep JWT_SECRET secure. Do not commit .env files.
- Replace development domain allowances (e.g., temporary Gmail checks) before production.
- For schema/migrations, see Drizzle ORM usage in the backend.

---

## Scripts

Backend
- npm start — start Fastify server

Mobile
- npm start — start Expo
- npm run web|android|ios — platform targets (requires tooling)

Admin Panel
- npm run dev — Vite dev server
- npm run build — production build
- npm run preview — preview build

---

## License

See LICENSE in this repository.

---
