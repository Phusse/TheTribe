# Technical Requirements Document (TRD)
**Project Name:** TheTribe  
**Date:** 2026-01-15  
**Version:** 1.0  
**Status:** Draft  

---

## 1. High-Level System Architecture
The system will follow a standard **Three-Tier Architecture**:
1.  **Presentation Layer (Client):** Needs to be highly responsive, SEO-friendly (for landing), and secure.
2.  **Application Layer (API):** RESTful API or TBD Server Actions for business logic, auth, and data management.
3.  **Data Layer (Database):** Relational database to ensure data integrity for users, invites, and courses.

`[Client] <--> [HTTPS] <--> [API Server] <--> [Database]`

## 2. Technology Stack Selection
### 2.1 Frontend
*   **Framework:** **Next.js (React)**.
    *   *Reasoning:* Excellent performance, built-in routing, server-side rendering (SSR) for the landing page SEO, and a massive ecosystem of UI libraries.
*   **Styling:** **Tailwind CSS**.
    *   *Reasoning:* Speed of development, maintainability, and mobile-first utility classes.
*   **State Management:** React Context / Zustand (for simple global state like Auth).

### 2.2 Backend
*   **Runtime:** **Node.js** (via Next.js API Routes or separate Express.js server).
    *   *Recommendation:* Use **Next.js API Routes** for the MVP to keep the codebase unified (Monorepo).
*   **Language:** TypeScript (for type safety across full stack).

### 2.3 Database
*   **Database:** **PostgreSQL**.
    *   *Reasoning:* Robust, relational data modeling (Users -> Enrollments -> Courses).
*   **ORM:** **Prisma**.
    *   *Reasoning:* Type-safe interaction with the DB, easy migration management.

## 3. Database Schema Overview
*   **Users Table:** `id, email, password_hash, role (admin/member), invite_used_id, created_at`
*   **Invites Table:** `id, code, is_used, created_by, used_by_user_id`
*   **Courses Table:** `id, title, description, video_url, category`
*   **Progress Table:** `user_id, course_id, is_completed, last_watched_at`
*   **Posts Table:** `id, user_id, content, created_at` (For forum)

## 4. Authentication & Authorization
*   **Auth Strategy:** JWT (JSON Web Tokens) or Session-based via **NextAuth.js**.
*   **Invite System:**
    *   Registration endpoint *must* validate the `invite_code` against the `Invites` table.
    *   If valid: Create User -> Mark Invite as Used -> Generate Session.
    *   If invalid: Reject registration.
*   **RBAC (Role-Based Access Control):**
    *   `ADMIN`: Can create courses, generate invites, ban users.
    *   `MEMBER`: Can view courses, post in forum, update profile.

## 5. Security Considerations
*   **Data Protection:** All passwords hashed with bcrypt/Argon2.
*   **API Security:** Rate limiting on auth endpoints to prevent brute force (e.g., max 5 login attempts/min).
*   **Inputs:** All user inputs (forum posts, profile bio) sanitized to prevent XSS.
*   **HTTPS:** Forced SSL encryption for all traffic.

## 6. Scalability & Extensibility
*   **Horizontal Scaling:** Next.js application can be deployed serverless (Vercel/AWS Lambda) or containerized (Docker) to scale automatically with load.
*   **Database:** Hosted PostgreSQL (e.g., Supabase, Neon, or AWS RDS) allows for easy vertical scaling and backups.
*   **Code Design:** Modular architecture (Service Repository pattern) to allow swapping the backend if needed in the future.

## 7. Future Integrations
*   **Payments:** Stripe API integration for subscriptions (Phase 2).
*   **Mobile Apps:** Build React Native app reusing the same Backend API (Phase 3).
*   **Video:** Mux or Vimeo API for professional video hosting (replacing direct embeds).
