# Skill Exchange Platform

Full-Stack Skill & Service Marketplace built with **React + Vite + Tailwind CSS** client and **Express + MongoDB + Socket.IO** server, with **Firebase Authentication** and **Razorpay** escrow payments.

## Quick Start (Local Development)

### 1. Configure Environment Variables
Copy the example environment files in both workspaces:
```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

### 2. Install Monorepo Dependencies
At the repository root:
```bash
npm install
```

### 3. Start Both Client & Server Concurrently
```bash
npm run dev
```
- **Client Web App:** `http://localhost:5173`
- **Server REST API:** `http://localhost:5000/api/v1`
- **API Health Endpoint:** `http://localhost:5000/api/v1/health`

---

## 🚀 Implementation Across All 15 Phases

- **Phase 1 (Foundation):** npm workspaces monorepo, Express app with Helmet, CORS, rate limiting, request logging, safe centralized error handling, and health endpoint.
- **Phase 2 (Mongoose Models & Constraints):** 14 normalized models: `User`, `Organization`, `Task`, `Application`, `Conversation`, `Message`, `NegotiatedTerms`, `Class`, `Enrollment`, `Payment`, `Review`, `Notification`, `Report`, `AdminAction`. Unique constraints on duplicate applications, reviews, enrollments, and terms.
- **Phase 3 (Authentication & Identity Sync):** Firebase Email/Password, Google sign-in, and password reset. Server-side token verification with auto MongoDB user profile synchronization and role middleware.
- **Phase 4 (Task Marketplace Core):** Task draft creation, editing, deleting, submission for moderation, keyword/category/skill/budget/mode search and filtering.
- **Phase 5 (Proposals & Provider Acceptance):** Provider bids with pitch and duration. Requester shortlist/reject/accept controls. Transactional acceptance that auto-rejects competing proposals.
- **Phase 6 (Real-time Messaging):** Private Socket.IO rooms created on provider selection, token handshake auth, participant verification, message persistence, typing indicators.
- **Phase 7 (Milestone & Terms Negotiation):** Interactive terms agreement in INR. Counter-proposals increment versions; dual acceptance advances state to `payment_pending`.
- **Phase 8 (Razorpay Escrow Payments):** Server-side Razorpay orders from mutually accepted terms. Client checkout and HMAC SHA256 signature verification. Task transitions to `in_progress`. Optional webhook at `/api/v1/payments/webhook`.
- **Phase 9 (Task Completion & Dual Reviews):** Provider requests completion $\rightarrow$ Requester confirms. Dual rating system restricted to verified task participants with 1 review per task. Recalculates average rating.
- **Phase 10 (Workshops & Classes):** Instructor class drafting, moderation submission, public class discovery, and transactional seat capacity management.
- **Phase 11 (Notification Engine):** In-app notification center with unread badges, mark-all-read, and deep links to tasks and chats.
- **Phase 12 (Admin Moderation & Governance):** Admin moderation queues for tasks and classes, dispute report resolution, and immutable audit logging.
- **Phase 13 (Role-Aware Dashboards):** Live analytics and metrics for Requesters, Providers, Instructors, and Administrators.
- **Phase 14 (Mobile & Accessibility Polish):** Responsive mobile drawer, touch-friendly navigation, skip-to-content accessibility link, and WCAG focus states.
- **Phase 15 (Production Readiness & Render Deploy):** Multi-origin CORS allow-list, security hardening, automated health check script (`npm run check:health`), and `render.yaml` Blueprint.

---

## 🛠️ Verification & Health Check

Run the automated health check script against the running server:
```bash
npm run check:health --workspace server
```

---

## 🔒 Security Checklist

1. **Environment Files:** Never commit `.env` files or Firebase service account private keys to source control.
2. **Payment Verification:** Razorpay orders are calculated exclusively on the backend from mutually agreed terms; signature verification is strictly enforced using HMAC SHA-256.
3. **CORS:** Limit `CLIENT_URL` strictly to trusted domains in production.
4. **Admin Role Assignment:** Grant admin privileges directly in MongoDB Atlas or through authorized administrative operations.

