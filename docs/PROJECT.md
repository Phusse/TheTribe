# TheTribe — Project Overview

This document describes the **TheTribe** monorepo: architecture, major features, API surface, data model, configuration, and tooling. It is intended for onboarding and operations (local dev, deployment, and maintenance).

---

## 1. What This Project Is

**TheTribe** is a full-stack web application for a member community: training modules, live sessions, direct messages, groups, member connections, invite-based registration, and an admin workspace for users, invites, groups, training content, sessions, stats, and system settings.

- **Frontend:** Single-page app (SPA) built with **Vite**, **React 18**, **TypeScript**, **React Router**, **TanStack Query**, and a **Radix / shadcn-style** UI stack (Tailwind).
- **Backend:** **Node.js** **Express** API with **Prisma** ORM targeting **PostgreSQL**, **JWT** auth (access + refresh), **Socket.IO** for real-time messaging infrastructure, **Cloudinary** for media, and **SMTP** (e.g. Nodemailer) for transactional email.
- **Shared:** NPM workspace **`@thetribe/shared`** holds **Zod** schemas and TypeScript types used by both client and server.

---

## 2. Repository Layout (Monorepo)

| Path | Package | Role |
|------|---------|------|
| `/` | `thetribe` | npm **workspaces** root; scripts to run/build client and server |
| `client/` | `vite_react_shadcn_ts` | Browser UI (Vite + React) |
| `server/` | `@thetribe/server` | REST API + Socket.IO + Prisma |
| `shared/` | `@thetribe/shared` | Shared Zod schemas and TS types |

**Root scripts** (`package.json`):

- `npm run dev` — runs client and server together (`concurrently`).
- `npm run dev:client` / `npm run dev:server` — one side only.
- `npm run build:client` / `npm run build:server` — production builds.

---

## 3. Client (`client/`)

### 3.1 Stack

- **Vite 5** with `@vitejs/plugin-react-swc`
- **React 18**, **react-router-dom** v6
- **@tanstack/react-query** for server state
- **axios** for HTTP (see `src/lib/api.ts`)
- **zod** + **react-hook-form** on forms
- **Tailwind CSS** + **Radix UI** primitives + project components under `src/components/ui/`

### 3.2 Entry and dev server

- Entry: `index.html` → `src/main.tsx` → `src/App.tsx`
- Vite dev server: **`host: "::"`**, port **8080** (see `vite.config.ts`)
- Path alias: `@/` → `src/`

### 3.3 Routing (`src/App.tsx`)

**Public**

- `/` — Landing  
- `/login`, `/register`, `/forgot-password`, `/reset-password`, `/pledge`

**Member (protected by `ProtectedRoute`)** — layout `DashboardLayout` under `/dashboard`:

- `/dashboard` (index)
- `/dashboard/training`, `/dashboard/live`, `/dashboard/messages`, `/dashboard/groups`, `/dashboard/connections`, `/dashboard/profile`, `/dashboard/settings`

**Admin (protected by `AdminRoute`)** — layout `AdminLayout` under `/admin`:

- `/admin` (overview), `users`, `invites`, `groups`, `training`, `sessions`, `stats`, `reports`, `settings`

**Other**

- Full-app **maintenance** UI when window event `app:maintenance` fires (e.g. after API **503** from auth middleware).
- `*` — `NotFound`

### 3.4 API client and auth (`src/lib/api.ts`)

- **Base URL:** `import.meta.env.VITE_API_URL` (Vite), with a **fallback** of `http://localhost:3002/api` if unset.
- **Credentials:** `withCredentials: true` (cookies + CORS).
- **Access token:** Sent as `Authorization: Bearer <accessToken>` where `accessToken` is read from `localStorage`.
- **Refresh:** On **401**, the client attempts `POST .../auth/refresh` with refresh token, retries the request, or dispatches `auth:logout` on failure.
- **Maintenance:** On **503**, dispatches `app:maintenance`.
- **Response shape:** Successful responses are normalized to **`response.data`** in the interceptor (callers receive the API payload, not the raw Axios response).

`AuthContext` loads the current user via `GET /users/me` when a token exists.

### 3.5 Dependency on `shared`

The client imports `@thetribe/shared` (e.g. login/register schemas, admin types). Resolution is via the **workspace** monorepo layout (install from repository root).

### 3.6 Environment (Vite)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Base URL for the API, **including `/api`** (e.g. `https://api.example.com/api`). |

---

## 4. Server (`server/`)

### 4.1 Stack

- **Express** on Node (**CommonJS** in `package.json**)
- **TypeScript** compiled with `tsc` → `dist/`
- **Prisma** for PostgreSQL
- **Socket.IO** attached to the same HTTP server as Express
- **Helmet**, **cors**, **cookie-parser**, **express.json** (10mb limit)

### 4.2 Process entry (`src/index.ts`)

1. Load env via `dotenv/config` and validated `src/config/env.ts`.
2. Create HTTP server from Express `app`.
3. Attach **Socket.IO** with CORS `origin: env.CLIENT_URL`, `credentials: true`.
4. Register `registerMessageGateway(io)` for messaging WebSocket behavior.
5. Middleware: `helmet`, `cors`, JSON body parser, `cookieParser`.
6. Mount routes under `/api/...`.
7. 404 JSON handler, then global `errorMiddleware`.
8. Listen on `env.PORT`.

### 4.3 Configuration

**CORS** (`src/config/cors.ts`): single allowed **`origin`** = `env.CLIENT_URL`, `credentials: true`. The browser origin of the SPA must match this value exactly in production.

**Environment** (`src/config/env.ts`): validated with **Zod**. Required and optional variables include:

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `development` \| `production` \| `test` (default `development`) |
| `PORT` | Server port (default **3001** in schema) |
| `DATABASE_URL` | PostgreSQL connection string (required) |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Min length **32** |
| `JWT_ACCESS_EXPIRES_IN` / `JWT_REFRESH_EXPIRES_IN` | Defaults e.g. `15m` / `7d` |
| `CLIENT_URL` | Full URL of the SPA for CORS/Socket (default `http://localhost:5173`) |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Media (required) |
| `SMTP_USER`, `SMTP_PASS` | Email (required; `SMTP_USER` must be email-shaped) |

The checked-in **`server/.env.example`** documents local defaults but does not list every key enforced in `env.ts`; use **`env.ts`** as the source of truth for production.

### 4.4 Middleware

| File | Role |
|------|------|
| `validate.middleware.ts` | Validates `req.body` with Zod |
| `auth.middleware.ts` | `authenticate` — JWT access token, attaches `req.user`; non-`SUPERADMIN` users get **503** when `SystemSettings.maintenanceMode` is true |
| `role.middleware.ts` | `requireRole("ADMIN" \| "SUPERADMIN")` — role hierarchy MEMBER &lt; ADMIN &lt; SUPERADMIN |
| `error.middleware.ts` | Maps Zod errors, `AppError`, Prisma `P2002`, and generic 500 |

### 4.5 HTTP routes (all prefixes are under the Express app as mounted in `index.ts`)

Base path for the API in deployment is **`/api`**. The client’s `VITE_API_URL` should end with **`/api`** so requests hit e.g. `GET /api/health`.

| Mount | Router file | Notes |
|-------|-------------|--------|
| `/api` | `routes/health.route.ts` | `GET /health` → health payload |
| `/api/auth` | `modules/auth/auth.routes.ts` | See §4.6 |
| `/api/users` | `modules/users/users.routes.ts` | All routes `authenticate` |
| `/api/training` | `modules/training/training.routes.ts` | Mixed member/admin |
| `/api/sessions` | `modules/sessions/sessions.routes.ts` | All `authenticate`; create needs `ADMIN`+ |
| `/api/messages` | `modules/messages/messages.routes.ts` | All `authenticate` |
| `/api/groups` | `modules/groups/groups.routes.ts` | All `authenticate`; CRUD for groups restricted to inline `adminOnly` (ADMIN/SUPERADMIN) |
| `/api/connections` | `modules/connections/connections.routes.ts` | All `authenticate` |
| `/api/invites` | `modules/invites/invites.routes.ts` | `authenticate` + `requireRole("ADMIN")` on all |
| `/api/admin` | `modules/admin/admin.routes.ts` | Stats, users, reports placeholder, settings, SUPERADMIN user patches — see §4.7 |
| `/api/search` | `modules/search/search.routes.ts` | `authenticate`; global search |

### 4.6 Auth routes (`/api/auth`)

**Public**

- `POST /register` — body validated with shared/register schema (from server’s `auth.schema` / shared patterns)
- `POST /login`, `POST /refresh`, `POST /logout`
- `POST /forgot-password`, `POST /reset-password`

**Protected (`authenticate`)**

- `GET /me` — session user via `meController`
- `POST /pledge` — pledge acceptance

### 4.7 Admin routes (`/api/admin`)

- `GET /stats`, `GET /users` — `ADMIN`+
- `GET /reports` — stub/placeholder response in routes file
- `GET /settings`, `PATCH /settings` — system settings (`ADMIN`+)
- `PATCH /users/:id/role`, `PATCH /users/:id/status` — `SUPERADMIN` only

### 4.8 Other route summaries

- **Users** (`/api/users`): `GET/PATCH /me`, `PATCH /me/settings`, `GET /me/stats`, `GET /discover` — all authenticated.
- **Training** (`/api/training`): members `GET /modules`, `PATCH /progress`; admins CRUD `/modules`, `/lessons` under the same router with `requireRole("ADMIN")`.
- **Sessions** (`/api/sessions`): `GET /` members; `POST /` admins.
- **Messages** (`/api/messages`): `GET /conversations`, `GET /:partnerId/history`, `POST /:partnerId` (REST messaging; gateway comment notes WebSocket path).
- **Groups** (`/api/groups`): list/join/leave/messages + admin create/update/delete.
- **Connections** (`/api/connections`): list, request, patch status, delete.
- **Invites** (`/api/invites`): admin-only list, attempts, create, delete.
- **Search** (`/api/search?q=`): min query length 2; returns grouped results.

### 4.9 Socket.IO (`modules/messages/messages.gateway.ts`)

- Authenticates connections using JWT from `socket.handshake.auth.token` or `Authorization` header.
- Tracks online users, emits online/offline, handles `message:send` / `message:typing`, persists via services where applicable.
- The **React client codebase does not currently import `socket.io-client`** (messages may rely primarily on REST + polling patterns in the UI); the server gateway is implemented for real-time use.

### 4.10 Scripts (`server/package.json`)

| Script | Purpose |
|--------|---------|
| `dev` | `nodemon` + `ts-node` on `src/index.ts` |
| `build` | `tsc` |
| `start` | `node dist/index.js` |
| `db:migrate` | `prisma migrate dev` |
| `db:push` | `prisma db push` |
| `db:generate` | `prisma generate` |
| `db:seed` | `ts-node prisma/seed.ts` |
| `make-admin` | `ts-node prisma/make-admin.ts` |

---

## 5. Database (Prisma + PostgreSQL)

**Provider:** PostgreSQL (`server/prisma/schema.prisma`). **`DATABASE_URL`** must point at a Postgres instance (e.g. **Supabase** in production).

### 5.1 Enum

- **`Role`:** `MEMBER`, `ADMIN`, `SUPERADMIN`

### 5.2 Models (summary)

| Model | Purpose |
|-------|---------|
| **User** | Core account: name, email, password hash, role, profile fields, `pledgeAccepted`, `isActive`, relations to messages, connections, groups, training, invites, settings, refresh tokens |
| **RefreshToken** | Refresh token storage; cascade delete with user |
| **TrainingModule** / **Lesson** | Training content hierarchy |
| **TrainingProgress** | Per-user progress per module; `@@unique([userId, moduleId])` |
| **LiveSession** | Scheduled sessions (title, description, date/time, URLs, thumbnail) |
| **Message** | Direct messages between two users |
| **Group** / **GroupMember** / **GroupMessage** | Groups and group chat |
| **Connection** | Connection requests between users; `@@unique([requesterId, receiverId])` |
| **InviteCode** | Invite codes; creator and optional single `usedBy` |
| **InviteAttempt** | Audit log of registration attempts (code, email, status, IP) |
| **UserSettings** | 1:1 user preferences (notifications, dark mode, etc.) |
| **SystemSettings** | Singleton-style row: `maintenanceMode`, `requireInviteCode`, `openRegistration`, notification flags, etc. |

Migrations live under `server/prisma/migrations/` (when present). Use `prisma migrate deploy` in production after setting `DATABASE_URL`.

---

## 6. Shared package (`shared/`)

**Package name:** `@thetribe/server` maps it in `server/tsconfig.json`; the client resolves it via workspaces.

**Exports** (`shared/src/index.ts`):

- **Types:** `types/user`, `training`, `session`, `message`, `group`, `connection`, `invite`
- **Schemas:** `auth.schema`, `user.schema`, `training.schema`, `admin.schema`, `group.schema`

Purpose: **one source of truth** for validation rules and DTO shapes across client and server.

---

## 7. Security and product rules (high level)

- **Passwords** stored hashed (`passwordHash` on `User`).
- **JWT** access tokens for API auth; **refresh** flow with stored refresh tokens.
- **Role-based** access for admin and superadmin operations.
- **Maintenance mode:** When `SystemSettings.maintenanceMode` is true, authenticated routes that use `authenticate` return **503** for users who are not `SUPERADMIN` (see `auth.middleware.ts`).
- **CORS** is locked to **`CLIENT_URL`** — set this to your deployed SPA origin.
- **Media:** Cloudinary credentials are **required** at server startup per `env.ts`.

---

## 8. Testing and quality

| Area | Status |
|------|--------|
| **Client** | **Vitest** + Testing Library (`npm run test`); `vitest.config.ts`, `src/test/setup.ts` |
| **Client E2E** | **Playwright** config present (`playwright.config.ts`) |
| **Server** | `npm test` is a placeholder (no automated test runner configured) |
| **ESLint** | **Client** has flat `eslint.config.js`; **server** has no ESLint config in-repo |
| **CI** | No `.github/workflows` found in the repository (add if you need CI) |

---

## 9. Local development notes

- **Port alignment:** Server `env` defaults include **`PORT` 3001** and **`CLIENT_URL` http://localhost:5173**, while Vite is set to **8080** and the client API fallback uses **3002**. For smooth local dev, align **`VITE_API_URL`**, **`PORT`**, and **`CLIENT_URL`** in your `.env` files (e.g. `CLIENT_URL=http://localhost:8080` if you use Vite on 8080).
- Run from repo root: `npm install`, then `npm run dev`.

---

## 10. Deployment (conceptual)

Typical split:

- **Frontend (e.g. Vercel):** Build from monorepo root with workspace build; output **`client/dist`**. Set **`VITE_API_URL`** to your API base including **`/api`**.
- **Backend (e.g. Render):** **`server`** root; install, `prisma generate`, `tsc`, `node dist/index.js`. Set all **`env.ts`** variables; **`DATABASE_URL`** for **Supabase** Postgres; Cloudinary for media.

**Order:** Deploy API → set **`CLIENT_URL`** on the server to the SPA origin → set **`VITE_API_URL`** on the frontend → redeploy client.

---

## 11. Document maintenance

This file was generated to reflect the repository structure and key files. When you add routes, env vars, or major features, update **`docs/PROJECT.md`** (or replace with generated docs) so it stays accurate.
