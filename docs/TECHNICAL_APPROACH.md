# BookLeaf Publishing — Technical Approach & Architecture Write-up

## 1. Problem & Product Approach
BookLeaf Publishing processes 1,200+ titles monthly across a catalog of 22,000+ books. The core operational bottleneck was manual, asynchronous author communication: high ticket volume during quarterly royalty payouts, ISBN catalog indexing lags across Amazon/Flipkart, and printing quality inquiries.

Our solution is a **two-sided publishing support portal** powered by an **AI-assisted operations triage engine**:
- **Author Portal:** Empowers authors with transparent real-time views into their book performance (copies sold, net profit calculations, 80/20 royalty split tracking, payout eligibility), and a streamlined support query submission workflow with instant feedback.
- **Admin Operations Portal:** Equips the editorial operations team with an operational triage workspace that combines automated AI classification, priority scoring, explainable reasoning, and editable grounded response drafts.

---

## 2. Architecture & Design Trade-offs

### Stack Selection
- **Backend:** Node.js + Express + JavaScript (ES Modules) + PostgreSQL (`pg`). Raw SQL migrations and parameterized queries were chosen to ensure zero ORM overhead, full query transparency, and seamless execution on any PostgreSQL host (local or Neon/Render).
- **Frontend:** React + Vite + JavaScript (JSX) + Tailwind CSS + React Router. Pure JavaScript with custom React hooks (`useState`, `useEffect`) was chosen for speed, lean bundle size (340 kB total JS), and maintainability without heavy abstraction layers.
- **Database & Data Modeling:** Strict relational modeling with foreign key constraints and indexes on high-throughput query paths (`status`, `priority`, `category`, `author_id`). The supplied dataset of 10 authors and 18 books was preserved with 100% fidelity, maintaining genuine edge cases (zero royalties, null publication dates for manuscripts in production, and platform availability arrays).

---

## 3. AI System Design & Knowledge Base Grounding
AI integration is the central feature and was engineered with production rigor:

1. **Provider Abstraction:** Implemented `GeminiProvider` using `@google/generative-ai` with configurable model selection via `GEMINI_MODEL` (default: `gemini-2.0-flash`).
2. **Deterministic Heuristic Fallback:** If `GEMINI_API_KEY` is not provided, or when network latency/rate limits occur, the system automatically falls back to an explainable rule-based engine. It categorizes tickets across the exact 6 business categories and 4 priority levels, ensuring author ticket creation never fails due to an external AI outage.
3. **Targeted Knowledge Base Retrieval (Cost-Conscious):** Instead of dumping the entire company knowledge base on every call, the prompt builder selects only the specific policy section matching the ticket category (e.g. 80/20 royalty formula and 45-day quarterly payout cycle for Royalty inquiries; Delhi print facility and 5–7 day free reprint policy for Printing defects).
4. **Human-in-the-Loop Safeguard:** AI drafts are generated on-demand as editable suggestions in the triage workspace. AI text is **never sent automatically** without editorial sign-off.

---

## 4. Security & Access Control
- **Authentication:** Stateless JWT bearer tokens signed server-side with HMAC SHA-256. Passwords stored using 10-round bcrypt hashes.
- **Role-Based Access Control (RBAC):** Authors are strictly restricted to their own books and tickets (`WHERE author_id = $1`). Admin routes (`/api/v1/admin/*`) reject author tokens with HTTP 403.
- **Data Isolation:** Private internal notes recorded by administrators are excluded at the database query level on all author-facing endpoints. Author WebSocket rooms are segregated (`author:<authorId>`) so authors never receive broadcasts of internal notes or other authors' tickets.

---

## 5. Production Evolution Path
To scale this architecture to BookLeaf's full 22,000+ title catalog:
1. **Background Job Queue:** Integrate BullMQ / Redis for asynchronous AI classification and webhook notifications.
2. **Vector Retrieval (RAG):** Embed BookLeaf's expanded author handbook and contracts into pgvector for sub-paragraph policy grounding.
3. **Automated Platform Sync Webhooks:** Connect Amazon SP-API and Flipkart Marketplace APIs to auto-resolve stock sync tickets when inventory reflects live.
