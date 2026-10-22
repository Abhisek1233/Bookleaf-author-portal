# BookLeaf Publishing — Author Support & Communication Portal

A full-stack, two-sided support portal and AI-powered operations triage engine built for **BookLeaf Publishing**, one of India's leading self-publishing houses (processing 1,200+ monthly books across a 22,000+ title catalog).

---

## 📖 Table of Contents
1. [Project Overview & Key Features](#-project-overview--key-features)
2. [Technology Stack](#-technology-stack)
3. [Architecture & Design Decisions](#-architecture--design-decisions)
4. [AI System Architecture & Knowledge Grounding](#-ai-system-architecture--knowledge-grounding)
5. [Demo Credentials (Pre-Seeded)](#-demo-credentials-pre-seeded)
6. [Prerequisites & Local Installation](#-prerequisites--local-installation)
7. [Environment Variables](#-environment-variables)
8. [Database Setup, Migrations & Seeding](#-database-setup-migrations--seeding)
9. [Running the Application](#-running-the-application)
10. [Running Automated Tests](#-running-automated-tests)
11. [API Documentation (Swagger & Postman)](#-api-documentation-swagger--postman)
12. [Real-Time Communication (Socket.IO)](#-real-time-communication-socketio)
13. [Deployment Guide](#-deployment-guide)
14. [Known Limitations & Future Roadmap](#-known-limitations--future-roadmap)

---

## 🌟 Project Overview & Key Features

### Two-Sided Portal
- **Author Portal (Author-Facing):**
  - **Overview Dashboard:** Live database metrics showing published titles, copies sold, royalties earned (80% net profit share), royalties paid, and pending balance with ₹1,000 threshold notices.
  - **My Books:** Searchable, filterable catalog of all books owned by the author with detailed breakdown of MRP, royalty per copy, print partner, and live retail platforms (Amazon India, Flipkart, BookLeaf Store, Amazon US/UK). Gracefully handles edge cases (zero royalties, books in production).
  - **Submit Support Query:** Structured form with book dropdown (strictly limited to author's titles + "General/Account Level" option), subject line, character-counted detailed query, and photographic attachment UI. Persists immediately to the database prior to AI invocation.
  - **My Tickets:** Real-time conversation timeline with status badges (Open, In Progress, Resolved, Closed), official response history, and author reply composer. Updated live via WebSockets.
  - **Author Profile:** Complete verified author record from the BookLeaf dataset.

- **Admin Operations Portal (Admin-Facing):**
  - **Operations Overview:** Real-time KPIs tracking total tickets, open tickets, in-progress tickets, urgent unresolved tickets (Critical/High), awaiting first response, and resolved tickets. Includes priority and category distribution charts and an oldest urgent tickets triage launcher.
  - **Support Queue:** Server-backed pagination, search, status filter, category filter, priority filter, and default **Urgency-First Sorting** (Critical/High and oldest unresolved tickets surface first).
  - **Triage Workspace (2-Column Desktop Layout):**
    - *Left Column:* Full query description, author profile context, linked book catalog & royalty context, conversation timeline, and official reply composer.
    - *Right Column:* AI classification & priority suggestions with explainable reasoning, Admin Override controls (Category & Priority), Status transition manager, Staff assignment, and Private Internal Notes.
  - **AI Response Drafting Assistant:** Generates editable support drafts grounded strictly in BookLeaf policies and verified author book figures. The draft is strictly an assistant tool—**never sent automatically without editorial review**.

---

## 🛠 Technology Stack

In strict accordance with the project requirements:

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18 + Vite + JavaScript (JSX) | Fast HMR, pure JavaScript, zero bundler bloat |
| **Styling** | Tailwind CSS v4 | Editorial publishing aesthetics, accessible contrast |
| **Routing** | React Router v7 | Declarative RBAC and nested layouts |
| **State & Data Fetching** | Native React Hooks (`useState`, `useEffect`) | Zero external cache library dependency, explicit state |
| **Backend** | Node.js + Express + JavaScript (ESM) | Lightweight, predictable REST API conventions |
| **Database** | PostgreSQL 18 + `pg` (node-postgres) | Raw SQL migrations, parameterized queries, zero ORM bloat |
| **Authentication** | JWT Bearer Tokens + bcryptjs | Secure stateless auth, 10-round salted password hashing |
| **Real-Time** | Socket.IO | Bi-directional events with automatic polling fallback |
| **AI Provider** | Google Gemini API (`@google/generative-ai`) | Fast, production model (`gemini-3.5-flash-lite`) + Heuristic Fallback |
| **Testing** | Vitest + Supertest + Testing Library | High-speed unit and API integration testing |
| **API Docs** | OpenAPI 3.0 (Swagger UI) + Postman | Interactive documentation at `/api/docs` |

---

## 🏛 Architecture & Design Decisions

```mermaid
flowchart TD
    subgraph Frontend["Frontend Client (React + Vite)"]
        UI_Author["Author Portal (/author/*)"]
        UI_Admin["Admin Operations Portal (/admin/*)"]
        AuthContext["Auth Context (JWT State)"]
        SocketClient["Socket.IO Client"]
    end

    subgraph Backend["Backend API (Node.js + Express)"]
        Router["Express Router (/api/v1)"]
        AuthMiddleware["Auth & RBAC Middleware"]
        Controllers["Controllers (Author, Admin, Auth)"]
        AIService["AI Service Layer"]
        GeminiAdapter["Gemini Provider Adapter"]
        HeuristicFallback["Deterministic Heuristic Fallback"]
        KnowledgeBase["Targeted Knowledge Base"]
        SocketServer["Socket.IO Server (Rooms & Auth)"]
    end

    subgraph Database["PostgreSQL Database (pg)"]
        AuthorsTable["authors (10 Seeded)"]
        BooksTable["books (18 Seeded)"]
        UsersTable["users (11 Seeded)"]
        TicketsTable["tickets"]
        MessagesTable["ticket_messages"]
        NotesTable["internal_notes (Admin-only)"]
        DraftsTable["ai_drafts"]
    end

    UI_Author -->|REST API Requests| Router
    UI_Admin -->|REST API Requests| Router
    UI_Author <-->|WebSocket Events| SocketServer
    UI_Admin <-->|WebSocket Events| SocketServer
    Router --> AuthMiddleware --> Controllers
    Controllers --> AIService
    AIService --> GeminiAdapter
    AIService --> HeuristicFallback
    GeminiAdapter --> KnowledgeBase
    Controllers --> Database
    SocketServer --> Database
```

---

## 🤖 AI System Architecture & Knowledge Grounding

### 1. Exact Classification Categories (6)
1. `Royalty & Payments`
2. `ISBN & Metadata Issues`
3. `Printing & Quality`
4. `Distribution & Availability`
5. `Book Status & Production Updates`
6. `General Inquiry`

### 2. Exact Priority Levels (4)
- `Critical` — Severe metadata errors (duplicate/wrong ISBN on Amazon), payment failures, or urgent distribution blocks.
- `High` — Long-overdue royalties, verified physical print defects (blurry, damaged author copies).
- `Medium` — Production timeline checks (cover design / typesetting progress), standard royalty inquiries.
- `Low` — General metadata requests (updating author bio, Amazon blurb change).

### 3. Cost-Conscious Prompt Strategy
Instead of injecting the full company handbook into every LLM request, the system uses **Targeted Knowledge Base Injection** (`getRelevantKnowledge(category)`). It passes only the pertinent policy (e.g., 80/20 royalty split formula and quarterly 45-day window for royalty tickets; Delhi hub 5–7 day reprint protocol for printing tickets) reducing token consumption by ~70%.

### 4. Deterministic Heuristic Fallback (Graceful Degradation)
When `GEMINI_API_KEY` is not supplied, or if the API encounters rate limits or network errors:
- The system automatically engages `classifyTicketHeuristic` and `generateDraftHeuristic`.
- Keyword pattern analysis accurately tags the ticket across the 6 exact categories and 4 priorities.
- Tickets are persisted successfully without failure.
- Human review is preserved: admins can override any category or priority with 1 click.

---

## 🔑 Demo Credentials (Pre-Seeded)

The database seed creates **1 Administrator account** and **10 Author accounts** matching the 10 authors in `bookleaf_sample_data.json`. The login page also features a **1-Click Demo Login** assistant.

| Role | Name | Email | Password | Catalog Context |
|---|---|---|---|---|
| **Admin** | Editorial Operations Manager | `admin@bookleafpub.com` | `AdminPassword123!` | Full Queue & Triage Access |
| **Author** | Priya Sharma | `priya.sharma@email.com` | `Author123!` | 2 Titles (Fiction), ₹3,570 Pending |
| **Author** | Rohit Kapoor | `rohit.kapoor@email.com` | `Author123!` | 2 Titles (Tech/Startup), ₹7,744 Pending |
| **Author** | Ananya Reddy | `ananya.reddy@email.com` | `Author123!` | 1 Title, ₹2,546 Pending (Zero Prior Payout) |
| **Author** | Vikram Joshi | `vikram.joshi@email.com` | `Author123!` | 2 Titles, ₹3,350 Pending |
| **Author** | Meera Nair | `meera.nair@email.com` | `Author123!` | 2 Titles, ₹3,055 Pending |
| **Author** | Arjun Malhotra | `arjun.malhotra@email.com` | `Author123!` | 1 Title, ₹2,464 Pending |
| **Author** | Sneha Kulkarni | `sneha.kulkarni@email.com` | `Author123!` | 3 Titles (1 in Cover Design), ₹7,865 Pending |
| **Author** | Farhan Sheikh | `farhan.sheikh@email.com` | `Author123!` | 1 Title (Poetry), ₹0 Pending |
| **Author** | Kavita Deshmukh | `kavita.deshmukh@email.com` | `Author123!` | 2 Titles (1 in Typesetting), ₹850 Pending |
| **Author** | Diya Chatterjee | `diya.chatterjee@email.com` | `Author123!` | 2 Titles, ₹4,115 Pending |

---

## 💻 Prerequisites & Local Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (Tested on v22.13.1)
- **PostgreSQL**: v14.0 or higher (Tested on PostgreSQL 18)
- **Git**

### Installation Steps
```bash
# 1. Clone repository
git clone https://github.com/your-username/bookleaf-portal.git
cd bookleaf-portal

# 2. Install workspace dependencies
npm install
```

---

## ⚙️ Environment Variables

Copy `.env.example` in the root:
```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `PORT` | API Server Port | `4000` |
| `NODE_ENV` | Environment (`development` or `production`) | `development` |
| `DATABASE_URL` | PostgreSQL Connection String | `postgresql://postgres:root@localhost:5432/bookleaf_support?schema=public` |
| `JWT_SECRET` | Secret key for JWT session signing | `super_secret_jwt_key_bookleaf_support_portal_2026_dev` |
| `JWT_EXPIRES_IN` | Token duration | `7d` |
| `GEMINI_API_KEY` | Optional Google Gemini API Key | `AIzaSy...` (Leaves active fallback if unset) |
| `GEMINI_MODEL` | Gemini Model ID | `gemini-3.5-flash-lite` |
| `CLIENT_ORIGIN` | Allowed Frontend Origin for CORS | `http://localhost:5173` |

---

## 🗄️ Database Setup, Migrations & Seeding

```bash
# 1. Run raw SQL migrations (Creates tables and indexes)
npm run db:migrate

# 2. Run idempotent seed (Populates 10 authors, 18 books, 11 users, and demo tickets)
npm run db:seed
```

---

## 🚀 Running the Application

In two separate terminal sessions (or using root commands):

### Start Backend API:
```bash
npm run dev:api
# Output:
# BookLeaf Publishing Support API running on port 4000
# REST Endpoints: http://localhost:4000/api/v1
# OpenAPI Docs:   http://localhost:4000/api/docs
# WebSocket:      ws://localhost:4000
```

### Start Frontend Client:
```bash
npm run dev:web
# Output:
# Local: http://localhost:5173/
```

Access the application in your browser at `http://localhost:5173`.

---

## 🧪 Running Automated Tests

Run backend REST API integration tests and frontend component tests:
```bash
# Run Backend API & Security Tests (15 tests covering RBAC, AI fallback, notes isolation)
npm run test:api

# Run Frontend UI Tests (Component rendering & Indian Rupee formatting)
npm run test:web

# Run all tests
npm run test
```

---

## 📑 API Documentation (Swagger & Postman)

- **Interactive Swagger UI:** Visit `http://localhost:4000/api/docs` while the server is running.
- **Postman Collection:** Located at `docs/bookleaf_postman_collection.json`. Import into Postman to test all endpoints.

---

## ⚡ Real-Time Communication (Socket.IO)

- Socket handshake authenticates via JWT token.
- Room isolation:
  - Authors join `author:<author_id>` and `ticket:<ticket_id>`.
  - Admins join `admin_ops` and `ticket:<ticket_id>`.
- **Private Notes Isolation:** Internal notes added by an administrator emit strictly to `admin_ops` and are NEVER broadcast to author channels.
- Automatic polling fallback activates seamlessly if WebSocket upgrades are blocked by firewalls or proxies.

---

## 🌐 Deployment Guide

### Frontend (Vercel)
1. Push repository to GitHub.
2. Link project on [Vercel](https://vercel.com) with root directory set to `apps/web`.
3. SPA routing rules are pre-configured in `apps/web/vercel.json`.

### Backend (Render or Railway)
1. Create a Web Service pointing to `apps/api`.
2. Build command: `npm install`
3. Start command: `node src/server.js`
4. Supply environment variables: `DATABASE_URL`, `JWT_SECRET`, `GEMINI_API_KEY`, `CLIENT_ORIGIN`.
5. Pre-configured blueprint available in `render.yaml`.

---

## 📝 Known Limitations & Future Improvements
1. **File Uploads:** The ticket attachment control currently operates in simulated UI mode (as permitted by assignment guidelines). Production implementation would connect AWS S3 or Cloudinary pre-signed URLs.
2. **Platform Sync Webhooks:** Direct API integrations with Amazon SP-API and Flipkart Marketplace could auto-trigger stock sync and resolve inventory tickets without manual operations intervention.
3. **Multi-Admin Collision Detection:** Adding a visual "Staff member X is currently viewing/drafting this ticket" badge would prevent duplicate admin replies during peak volume.
