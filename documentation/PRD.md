# Product Requirements Document (PRD)
**Project Name:** TheTribe  
**Date:** 2026-01-15  
**Version:** 1.0  
**Status:** Draft  

---

## 1. User Personas
### 1.1 The Mentor ("The Guide")
*   **Role:** Platform Admin / Content Creator.
*   **Goals:** Distribute training, host live sessions, monitor community health.
*   **Pain Points:** Disorganized communication on other platforms, lack of focused engagement.

### 1.2 The Member ("The Initiate")
*   **Role:** Standard User.
*   **Goals:** Learn from specific modules, network with like-minded men, attend live events.
*   **Pain Points:** Overwhelmed by noise, looking for trusted advice and structure.

### 1.3 The Administrator
*   **Role:** System Admin (Technical).
*   **Goals:** Manage users, generate invite codes, troubleshoot system issues.
*   **Pain Points:** Manual user management, spam/bot prevention.

## 2. User Journeys
### 2.1 Onboarding Flow (The First Impression)
1.  **Invitation:** User receives a personalized invite link/code via email, emphasizing exclusivity.
2.  **Landing & Validation:** User lands on a high-aesthetic reception page. Enters code. System validates eligibility.
3.  **Account Creation:** User sets secure credentials and builds a "Member Card" profile (name, focus area, bio).
4.  **The Pledge:** User agrees to community standards ("The Code") before gaining access.
5.  **First-Time Login:** User is redirected to the Dashboard, greeted with a "Start Here" orientation video.

### 2.2 Engagement Loop (The Daily Habit)
1.  **Notification:** User receives a nudge (email/push) about a new module drop or live mentor session.
2.  **Consumption:** User logs in. Dashboard highlights the new content "featured" at the top.
3.  **Interaction:** User watches the content, then scrolls down to the discussion thread to leave a takeaway.
4.  **Reward:** Mentor or peer replies to the comment. User feels seen and valued.
5.  **Retention:** User checks the "Upcoming Events" widget and marks their calendar for the next live stream.

## 3. Functional Requirements
### 3.1 Authentication & User Management
*   **FR-001:** System must allow sign-up ONLY with a valid, unused invite code.
*   **FR-002:** Users must be able to log in via Email/Password.
*   **FR-003:** Admins must be able to generate, track, and revoke invite codes.

### 3.2 Dashboard & Experience
*   **FR-004 (Dashboard):** A dynamic "Home" view displaying:
    *   **Hero Section:** Latest video/module or live stream link.
    *   **Progress Widget:** Visual indicator of current training module completion.
    *   **Events Widget:** List of upcoming live sessions with "Add to Calendar" button.
    *   **Community Feed:** Preview of latest pinned or trending forum discussions.
*   **FR-005 (Navigation):** Global sidebar/top-nav for quick access to Training, Events, Community, and Profile.

### 3.3 Content Delivery
*   **FR-006:** Admins can upload/embed video training modules with rich text descriptions.
*   **FR-007:** Users can track progress (Mark as Complete / Resume).
*   **FR-008:** Content organized by linear "Paths" or Categories.

### 3.4 Live Mentoring
*   **FR-009:** Scheduled event management for Admins.
*   **FR-010:** Integration placeholder for live streaming (Zoom/YouTube Live links).

### 3.5 Community Features
*   **FR-011:** Discussion Board/Forum with thread creation and replying.
*   **FR-012:** Member Directory (read-only) to see other members' "Member Cards".

## 4. Non-Functional Requirements
*   **NFR-001 (Performance):** Dashboard loads in < 2 seconds.
*   **NFR-002 (Security):** Passwords hashed (bcrypt), HTTPS enforced.
*   **NFR-003 (Device):** Fully responsive web design (Mobile-First approach).
*   **NFR-004 (Scalability):** Support up to 1,000 concurrent users for MVP.

## 5. MVP Scope vs Future Roadmap
| Feature | MVP (Web Only) | Future Roadmap (v2+) |
| :--- | :--- | :--- |
| **Platform** | Responsive Web App | Native iOS/Android Apps |
| **Access** | Free (Invite Only) | Paid Subscriptions (Stripe) |
| **Live** | External Links (Zoom) | In-App Streaming |
| **Community** | Basic Text Forum | Real-time Chat, Groups |
| **Gamification** | N/A | Badges, Leaderboards |
