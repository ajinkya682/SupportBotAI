# SupportBotAI — Complete Technical Report

> **Generated from full codebase analysis of `/Users/ajinkyasaivar/Ajinkya Developer/SupportBotAI`**
> All conclusions are based on actual source code. Nothing is assumed or hallucinated.

---

# 1. Project Overview

| Field | Details |
|---|---|
| **Project Name** | SupportBotAI |
| **Project Purpose** | A B2B SaaS platform that lets any business owner deploy a branded, AI-powered customer support chatbot on their website in minutes, using a single `<script>` tag |
| **Business Problem Solved** | Small and medium businesses lose customers at off-hours because no one is available to answer questions. SupportBotAI provides 24/7 AI-powered support that escalates complex or frustrated users to a live human agent |
| **Target Users** | Business owners (SMBs), their customer support agents, and end-customers who visit those websites |
| **Main Value Proposition** | "Train in minutes, embed with one line of code, resolve tickets automatically" |
| **Industry Category** | Customer Support Software / Conversational AI / B2B SaaS |
| **Real World Use Cases** | Restaurant answering menu/hours queries; e-commerce store handling returns/orders; SaaS product handling FAQ and escalating billing disputes; local businesses providing 24/7 pre-sales support |

---

# 2. Executive Summary

SupportBotAI is a full-stack, multi-tenant AI customer support platform built with a React 19 frontend, an Express 5 backend, and MongoDB Atlas as the database. The platform enables any business to create a customized AI chatbot trained on their own knowledge base, embed it on any website with a single script tag, and monitor all conversations in real time from a rich dashboard.

**Core functionality includes:**
- AI chat powered by MistralAI's `mistral-large-latest` model
- Intelligent emotion and intent detection that auto-escalates angry or complex users to human agents
- Real-time Socket.IO communication between the chat widget, business dashboard, and support agents
- Web Push Notifications (VAPID/PWA) delivered to both owners and agents even when the browser is closed
- Workload-aware ticket routing that assigns conversations to the least-busy available agent
- Website scraping (Puppeteer + Cheerio + axios) that crawls up to 8 pages of a business's site to auto-populate the knowledge base
- A full Super Admin control panel for platform-level management, business blocking, subscription control, and CSV data export
- Background job scheduling via Agenda (idle ticket reminders, daily summaries, subscription expiry alerts)
- Email delivery via Resend for OTPs, welcome messages, and agent invitations

**Key innovations:**
- AI-to-human handoff with a confidence tagging system (`[CONFIDENCE: High/Low]`) that triggers automatic escalation
- Domain-level security for the embeddable widget (auto-allowlisting with per-plan limits)
- Agent heartbeat monitoring with a 60-second timeout that auto-marks stale agents as offline
- In-memory TTL cache for business config lookups to reduce database round trips during high-traffic chat
- Auto-resolve engine that resolves stale `in_progress` conversations every 20 seconds based on who spoke last

**Technical complexity:** High. The project spans multi-tenant SaaS architecture, real-time bidirectional communication, browser push notifications with service workers, headless Puppeteer-based scraping, MistralAI LLM integration with custom prompt engineering, and a three-tier role system.

---

# 3. Product Analysis

## Main Modules

| Module | Description |
|---|---|
| Public Marketing Site | Landing page, product page, pricing page, documentation |
| Authentication | Email/password + Google OAuth login, OTP-based password reset |
| Business Dashboard | Knowledge training, appearance editor, analytics, integration, team management |
| Agent Console | Live conversation inbox, AI suggestion copilot, profile management |
| Embeddable Chat Widget | Standalone iframe that runs on any third-party website |
| Notification System | In-app, Socket.IO, and Web Push notifications across roles |
| Super Admin Panel | Platform-level oversight of all businesses, agents, conversations, and settings |

## User Roles

| Role | Description |
|---|---|
| **Business Owner** | Creates account, trains AI, customizes widget, manages agents, views analytics |
| **Support Agent** | Handles escalated conversations, sends messages, resolves tickets |
| **End Customer** | Chats through the embedded widget on any website |
| **Super Admin** | Manages the entire platform, controls plans, blocks users, exports reports |

## User Journeys

**Business Owner Journey:**
1. Sign up (email/password or Google OAuth) → business auto-created
2. Navigate to Dashboard → Training tab → paste knowledge base text or enter website URL to auto-scrape
3. Appearance tab → customize bot name, theme color, welcome message, logo
4. Integration tab → copy one `<script>` tag → paste on website
5. Conversations tab → monitor live chats, take over from AI, resolve tickets
6. Team tab → add agents (email credentials sent automatically)
7. Notifications tab → receive alerts, read system messages

**Agent Journey:**
1. Receive welcome email with credentials → log in
2. Profile setup → set display name, role title, upload photo
3. Dashboard → see assigned tickets → join conversation (AI steps aside)
4. Chat with customer in real time → use AI Suggestion button for reply drafts
5. Resolve ticket → status updates back to online

**End Customer Journey:**
1. Visit any website with the widget installed
2. See branded floating chat bubble with animation
3. Click to open → chat window appears with welcome message
4. Send message → AI responds instantly
5. If AI can't answer or detects anger/urgency → message appears that a human is joining
6. Agent or owner joins → real human support continues

---

# 4. Feature Inventory

---

### Feature 1: Email/Password Authentication

**Feature Name:** Email/Password Registration and Login

**Description:** Secure user registration with bcrypt password hashing, JWT-based session tokens, and business profile auto-creation on signup.

**Business Purpose:** Enables business owners to create and access their private support dashboard securely.

**Technical Implementation:** On registration, `User.create()` saves a hashed password via a Mongoose `pre('save')` hook using `bcrypt.genSalt(10)` + `bcrypt.hash`. A `Business` document is simultaneously created for the new owner with a randomly generated `apiKey` (`sb_${crypto.randomBytes(16).toString('hex')}`). On login, `user.comparePassword()` is used. A JWT is signed with `process.env.JWT_SECRET` and expires after `JWT_EXPIRES_IN` (default 30 days).

**Files Responsible:** [`authController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/authController.js), [`User.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/models/User.js), [`authMiddleware.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/middleware/authMiddleware.js)

**Dependencies Used:** `jsonwebtoken`, `bcryptjs`

**API Endpoints Used:** `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`

**Database Models Used:** `User`, `Business`

---

### Feature 2: Google OAuth Login

**Feature Name:** Google OAuth Single Sign-On

**Description:** One-click login with a Google account using the `google-auth-library` SDK to verify ID tokens or access tokens. New users auto-get a business created.

**Business Purpose:** Reduces friction for new signups; increases conversion rate by removing password barriers.

**Technical Implementation:** The frontend uses `@react-oauth/google` to obtain a credential token. The backend `resolveGoogleUser()` function accepts either an `idToken` (verified via `OAuth2Client.verifyIdToken()`) or an `accessToken` (verified via a call to Google's userinfo endpoint). If the user doesn't exist, `User.create()` is called with the Google profile, and a `Business` is auto-created.

**Files Responsible:** [`authController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/authController.js)

**Dependencies Used:** `google-auth-library`, `axios`, `@react-oauth/google`

**API Endpoints Used:** `POST /api/auth/google`

**Database Models Used:** `User`, `Business`

---

### Feature 3: OTP-Based Password Reset

**Feature Name:** Forgot Password with Email OTP

**Description:** A 6-digit OTP is generated, stored with a 10-minute expiry on the User document, and sent via email through Resend. Verified before allowing password reset.

**Business Purpose:** Standard account recovery flow for lost credentials.

**Technical Implementation:** `Math.floor(100000 + Math.random() * 900000)` generates the OTP. It is stored in `user.resetPasswordOTP` with `user.resetPasswordExpires = Date.now() + 600000`. Verification queries `{ email, resetPasswordOTP: otp, resetPasswordExpires: { $gt: Date.now() } }`. After reset, OTP fields are cleared from the document.

**Files Responsible:** [`authController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/authController.js), [`email.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/email.js)

**Dependencies Used:** `resend`, `crypto`

**API Endpoints Used:** `POST /api/auth/forgot-password`, `POST /api/auth/verify-otp`, `POST /api/auth/reset-password`

**Database Models Used:** `User`

---

### Feature 4: AI Chat Engine

**Feature Name:** MistralAI-Powered Chat

**Description:** Each customer message is processed through the MistralAI `mistral-large-latest` model with a dynamically constructed system prompt containing the business's knowledge base, FAQs, detected emotion, detected intent, and visitor name. The AI responds with a confidence tag that drives escalation logic.

**Business Purpose:** Core product value — provides instant, accurate, 24/7 AI support tailored to the business's specific data.

**Technical Implementation:**
- `analyzeMessage()` uses keyword matching to detect emotion (`neutral`, `angry`, `urgent`) and intent (`general_query`, `billing`, `technical_support`, `account_management`)
- `buildSystemPrompt()` injects business knowledge, FAQs, support email, detected emotion, intent, and visitor name into a structured system prompt
- `mistral.chat.complete()` is called with `model: AI_MODEL` (default `mistral-large-latest`) and `maxTokens: AI_MAX_TOKENS` (default 1024)
- The AI is instructed to prefix replies with `[CONFIDENCE: High]` or `[CONFIDENCE: Low]` — the backend strips this tag and uses it for escalation logic
- `extractNameFromMessage()` uses regex patterns (`/my name is (.*?)(\.|$|!)/i`) to extract visitor names from conversation text

**Files Responsible:** [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js)

**Dependencies Used:** `@mistralai/mistralai`

**API Endpoints Used:** `POST /api/chat/message`

**Database Models Used:** `Business`, `Conversation`

---

### Feature 5: Automatic Escalation to Human Agent

**Feature Name:** AI-to-Human Handoff System

**Description:** When the AI returns `[CONFIDENCE: Low]`, or detects anger, or classifies intent as `account_management`, the conversation is automatically flagged as `human_needed`, an issue summary is AI-generated, and the conversation is routed to an available agent.

**Business Purpose:** Prevents customers from leaving frustrated when the AI doesn't know the answer. Bridges the gap between automation and human empathy.

**Technical Implementation:**
- `needsEscalation = confidence.toLowerCase() === 'low' || emotion === 'angry' || intent === 'account_management'`
- `generateIssueSummary()` calls `mistral-small-latest` with the last 5 messages to produce a one-sentence issue description
- `generateConversationTitle()` creates a 4-word title from the message and intent
- `routeTicket(conversationId, io)` is called from `utils/routing.js` to assign to the least-busy available agent

**Files Responsible:** [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js), [`routing.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/routing.js)

**Dependencies Used:** `@mistralai/mistralai`, `socket.io`

**Database Models Used:** `Conversation`, `Business`

---

### Feature 6: Embeddable Chat Widget

**Feature Name:** One-Line Script Embed Widget

**Description:** A dynamically generated JavaScript file (`/widget.js`) is injected into any third-party website via a single `<script>` tag. It creates a floating chat bubble, animated container, and iframe that loads the React chat UI.

**Business Purpose:** Zero-friction deployment on any website without requiring any framework knowledge from the business owner.

**Technical Implementation:**
- `/widget.js` is served from `/public/widget.template.js` with `__SERVER_BASE_URL__` replaced at runtime (server-side templating)
- The script creates a `<div id="supportbot-bubble">` and `<div id="supportbot-container">` with injected CSS including animations (`sbFloat`, `sbPulse`, `sbBounceIn`, `sbSlideUp` for mobile)
- The iframe's `src` points to `{clientUrl}/chat-widget/{apiKey}`
- PostMessage API is used for cross-origin communication: widget sends `close-supportbot`, `unread-count`; parent responds with `chat-opened`, `chat-closed`
- Unread message badge shown with pop animation when chat is closed
- Tooltip appears on hover showing "Chat with {botName}"
- Mobile responsive: full-screen slide-up on screens ≤480px

**Files Responsible:** [`widget.template.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/public/widget.template.js), [`server.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/server.js), [`ChatWidgetPage.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/widget/ui/pages/ChatWidgetPage.jsx)

**Dependencies Used:** Vanilla JavaScript (no framework), PostMessage API, Socket.IO client

**API Endpoints Used:** `GET /widget.js`, `GET /api/chat/config/:apiKey`

**Database Models Used:** `Business`

---

### Feature 7: Domain Security for Widget

**Feature Name:** Automatic Domain Allowlisting

**Description:** When the widget first loads on a third-party domain, the backend extracts the `origin` header, cleans it to a base domain, and adds it to `business.allowedDomains`. Free plan: 1 domain max. Pro plan: 10 domains max.

**Business Purpose:** Prevents unauthorized embedding of a business's chatbot on competitor or unknown sites. Enforces plan-level access control.

**Technical Implementation:** `getWidgetConfig` extracts the domain from `req.headers.origin`, normalizes it by removing `www.`, `https://`, and trailing slashes. If not in `allowedDomains` and below the limit, it's pushed and saved. If at limit, a `403` with `limitReached: true` is returned.

**Files Responsible:** [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js#L451-L502)

**API Endpoints Used:** `GET /api/chat/config/:apiKey`

**Database Models Used:** `Business`

---

### Feature 8: Real-Time Dashboard

**Feature Name:** Live Conversation Dashboard

**Description:** The business owner's main interface shows all conversations in real time. New conversations appear instantly, message counts update, and status changes are reflected without page refresh.

**Business Purpose:** Gives the business owner full visibility and control over customer interactions happening right now.

**Technical Implementation:** Socket.IO events `new_ticket`, `update_conversation`, `new_message`, `ticket_resolved`, `agent_joined`, `agent_status_changed` are emitted from the backend and consumed in the frontend. The owner joins their private Socket.IO room (`ownerId`) on login. The `Dashboard.jsx` (28KB) and `Conversations.jsx` (27KB) components handle the live inbox.

**Files Responsible:** [`socket.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/socket.js), [`Dashboard.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/dashboard/ui/pages/Dashboard.jsx)

**Dependencies Used:** `socket.io`, `socket.io-client`

---

### Feature 9: AI Training — Text Input

**Feature Name:** Knowledge Base Training (Manual Text)

**Description:** Business owners can paste any text (FAQs, business hours, menu, policies) into a text area in the Training tab. This is stored in `business.knowledge` and injected into every system prompt.

**Business Purpose:** Allows businesses to instantly customize the AI with their specific data without any technical knowledge.

**Technical Implementation:** `updateBusiness` in `businessController.js` saves the `knowledge` field via `Business.findOneAndUpdate`. After save, `cache.del(business.apiKey)` invalidates the in-memory cache so next chat requests use fresh data.

**Files Responsible:** [`businessController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/businessController.js), [`Training.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/dashboard/ui/components/Training.jsx)

**API Endpoints Used:** `PUT /api/business`

**Database Models Used:** `Business`

---

### Feature 10: AI Training — Website Scraper (Pro Feature)

**Feature Name:** Auto-Train from Website URL

**Description:** Pro users can enter their website URL. The backend crawls up to 8 pages using Puppeteer (for JS-rendered sites) with a Cheerio fallback (for static HTML), deduplicates content, and auto-populates the knowledge base.

**Business Purpose:** Eliminates manual knowledge base creation. Business owners simply enter their website URL and the AI is trained automatically.

**Technical Implementation:**
- `scrapeWebsite()` in `utils/scraper.js` runs a BFS crawler starting from the given URL
- Tries `fetchWithAxios` first (lightweight, 5s timeout); falls back to `fetchWithPuppeteer` (headless Chrome, 25s timeout)
- Puppeteer blocks images, fonts, and media to speed up loading
- `isDuplicate()` checks word overlap ≥85% similarity to prevent duplicate content
- Max 8 pages (`MAX_PAGES`), max 8000 characters of extracted knowledge (`MAX_CHARS`)
- On production (Render), uses `@sparticuz/chromium` for serverless-compatible headless Chrome
- Feature is gated: free plan returns `403` with `isPlanRestricted: true`
- 180-second server-side timeout enforced via `Promise.race`

**Files Responsible:** [`scraper.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/scraper.js), [`businessController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/businessController.js#L162-L235)

**Dependencies Used:** `puppeteer-core`, `@sparticuz/chromium`, `cheerio`, `axios`

**API Endpoints Used:** `POST /api/business/scrape`

**Database Models Used:** `Business`

---

### Feature 11: Widget Appearance Editor

**Feature Name:** Brand Customization Editor

**Description:** Business owners can customize the bot name, theme color, welcome message, company logo, and placeholder text. The widget immediately reflects these changes.

**Business Purpose:** Allows businesses to white-label the chatbot to match their brand identity.

**Technical Implementation:** The `appearance` object in the `Business` schema stores `themeColor`, `botName`, `welcomeMessage`, `botAvatar`, `companyLogo`, and `placeholderText`. When the business name is updated and the botName was still the default, the backend auto-syncs `botName` to match. Company logos are uploaded to ImageKit CDN via `multer` (memory storage) and the ImageKit SDK.

**Files Responsible:** [`businessController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/businessController.js), [`Appearance.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/dashboard/ui/components/Appearance.jsx)

**Dependencies Used:** `@imagekit/nodejs`, `multer`

**API Endpoints Used:** `PUT /api/business`, `POST /api/business/upload-logo`

**Database Models Used:** `Business`

---

### Feature 12: Agent Management

**Feature Name:** Team Member Management

**Description:** Business owners can add, list, and delete support agents. Each new agent receives a welcome email with their temporary password. Agents have a `roleTitle`, `displayName`, `profilePhoto`, and real-time `status`.

**Business Purpose:** Enables business owners to build a support team that collaborates on handling escalated tickets.

**Technical Implementation:** `addAgent` creates a `User` with `role: 'agent'` and `ownerId: req.user._id`. The welcome email is sent immediately via Resend, including the plaintext temporary password. `listAgents` enriches each agent with live stats (conversations handled today, total resolved) by querying the Conversation model. Agent status is tracked in real time via `agent_heartbeat` Socket.IO events and a 30-second server-side heartbeat interval.

**Files Responsible:** [`agentController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/agentController.js), [`TeamMembers.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/dashboard/ui/components/TeamMembers.jsx)

**Dependencies Used:** `resend`, `bcryptjs`, `socket.io`

**API Endpoints Used:** `POST /api/agents`, `GET /api/agents`, `DELETE /api/agents/:id`

**Database Models Used:** `User`, `Conversation`, `Business`

---

### Feature 13: Workload-Aware Ticket Routing

**Feature Name:** Intelligent Auto-Routing Engine

**Description:** When a conversation is escalated, the system automatically assigns it to the available agent with the lowest current workload.

**Business Purpose:** Prevents agent overload, ensures fair ticket distribution, and reduces customer wait time.

**Technical Implementation:** `routeTicket()` in `utils/routing.js`:
1. Fetches all agents with status `online` or `away`
2. For each agent, counts conversations with `routingStatus: { $in: ['assigned', 'in_progress'] }`
3. Sorts by count ascending (lowest workload first)
4. If the best agent has 0 active conversations → assigns (`routingStatus: 'assigned'`)
5. If all agents are busy → marks ticket as `holding`
6. If no agents online → marks ticket as `pending`
7. `checkHoldingTickets()` re-routes all holding/pending tickets when any agent comes online
- All assignment is done atomically via `findOneAndUpdate` with status guards to prevent race conditions

**Files Responsible:** [`routing.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/routing.js)

**Dependencies Used:** `socket.io` (for real-time assignment notifications + push)

**Database Models Used:** `User`, `Conversation`, `Business`

---

### Feature 14: Live Agent Chat

**Feature Name:** Real-Time Agent-to-Customer Messaging

**Description:** When an agent joins a conversation, the AI steps aside, a join message is sent, and the agent can chat directly with the customer in real time via Socket.IO.

**Business Purpose:** Provides the human empathy layer that AI cannot fully replicate for complex or emotional issues.

**Technical Implementation:**
- `joinConversation` REST endpoint uses atomic `findOneAndUpdate` with `$set: { isAiActive: false, status: 'in_progress' }` to prevent two agents joining simultaneously
- Emits `agent_joined` to both `session_{conversationId}` (widget room) and `owner_{ownerId}` (dashboard room)
- Agent sends messages via the `send_message` Socket.IO event
- Messages are persisted to `conversation.messages` in MongoDB before broadcasting
- Agent typing indicator via `typing` event → `agent_typing` emitted to widget's session room
- `toggle_ai` event allows toggling AI back on mid-conversation

**Files Responsible:** [`agentController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/agentController.js#L220-L313), [`socket.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/socket.js)

**Dependencies Used:** `socket.io`

**Database Models Used:** `Conversation`, `User`

---

### Feature 15: AI Agent Suggestion Copilot

**Feature Name:** AI Reply Suggestion for Agents

**Description:** When viewing a conversation, agents can click an "AI Suggest" button to get a drafted reply based on the full conversation history and business knowledge base.

**Business Purpose:** Speeds up agent response time and ensures consistent, knowledge-base-aligned replies even from new agents.

**Technical Implementation:** `getAgentSuggestion()` sends the full conversation history and knowledge base to `mistral-small-latest` with a prompt instructing it to "suggest a perfect, human-like reply for the agent to send." The response is returned as `{ suggestion: string }`.

**Files Responsible:** [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js#L401-L449)

**Dependencies Used:** `@mistralai/mistralai`

**API Endpoints Used:** `POST /api/chat/suggest`

**Database Models Used:** `Conversation`, `Business`

---

### Feature 16: Web Push Notifications (PWA)

**Feature Name:** Browser Push Notification System

**Description:** A full PWA-compatible push notification system using VAPID keys and the Web Push protocol. Owners and agents receive push notifications for new tickets, assignments, agent status changes, idle ticket alerts, and more — even when the browser tab is closed.

**Business Purpose:** Ensures that business owners and agents never miss a critical customer interaction, regardless of whether they're actively viewing the dashboard.

**Technical Implementation:**
- `web-push` configured with VAPID keys from environment variables
- Service Worker registered at `/sw.js` via `usePushNotifications.js` custom React hook
- Subscriptions stored in `PushSubscription` model with `userId`, `sessionId`, `browser`, `deviceType`, `isActive`
- `pushService.sendNotification()` checks: quiet hours, user notification preferences per type, rate limit (10 pushes/hour), then sends to all active subscriptions
- Dead subscriptions (410/404 response) auto-deactivated
- `PushNotificationLog` model tracks delivery status for every push attempt
- Guest/widget users also subscribe via `sessionId` (not userId)
- 9 notification preference types configurable per user (newTickets, teamActivity, etc.)

**Files Responsible:** [`pushService.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/pushService.js), [`usePushNotifications.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/shared/hooks/usePushNotifications.js)

**Dependencies Used:** `web-push`

**Database Models Used:** `PushSubscription`, `PushNotificationLog`, `User`

**API Endpoints Used:** `GET /api/notifications/vapid-public-key`, `POST /api/notifications/subscribe`, `POST /api/notifications/unsubscribe`

---

### Feature 17: In-App Notification Broadcast System

**Feature Name:** Multi-Level Notification Broadcasting

**Description:** Super Admin can broadcast messages to all business owners or target a specific owner. Business owners can broadcast messages to all their agents or target a specific agent. Messages are delivered via Socket.IO in real time and stored in MongoDB for read tracking.

**Business Purpose:** Platform-level communication channel for announcements, support messages, and team coordination.

**Technical Implementation:**
- `Notification` model tracks `senderId`, `senderRole`, `recipientId` (null for broadcast), `recipientRole`, `businessId`, `isBroadcast`, `readBy[]`
- Room-based Socket.IO delivery: `role_owner` (all owners), `business_{ownerId}_agents` (all agents of one business), `user_{userId}` (private rooms)
- `getMyNotifications()` uses role-aware queries to show only relevant notifications per user
- Read tracking: `readBy` array, `markAsRead` and `markAllAsRead` endpoints

**Files Responsible:** [`notificationController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/notificationController.js)

**Database Models Used:** `Notification`, `Business`, `User`

---

### Feature 18: Analytics Dashboard

**Feature Name:** Business Analytics

**Description:** The Analytics tab in the dashboard shows conversation volume trends, success rates, emotion distribution, intent breakdown, and agent performance metrics visualized with Recharts.

**Business Purpose:** Gives business owners data-driven insights to understand customer needs and team performance.

**Files Responsible:** [`Analytics.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/dashboard/ui/components/Analytics.jsx), `businessController.js` (`/api/business/stats`)

**Dependencies Used:** `recharts`

**API Endpoints Used:** `GET /api/business/stats`

---

### Feature 19: Agent Heartbeat & Auto-Offline

**Feature Name:** Real-Time Agent Presence Tracking

**Description:** Agents send heartbeat pings every 30 seconds via Socket.IO. If no heartbeat is received for 60 seconds, the agent is automatically set to `offline` and the owner dashboard is notified.

**Business Purpose:** Accurately reflects which agents are truly available. Prevents tickets from being routed to agents who have closed their browser.

**Technical Implementation:**
- `agent_heartbeat` Socket.IO event updates `user.lastHeartbeat = new Date()`
- `setInterval` in `server.js` (30s) queries for agents with `lastHeartbeat < 60s ago` and sets them offline
- Additional check inside `socket.js` runs every 60s for stale agents (2-minute threshold)
- On disconnect, a 5-second grace period allows for reconnects before marking offline

**Files Responsible:** [`server.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/server.js#L126-L149), [`socket.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/socket.js#L372-L436)

**Database Models Used:** `User`

---

### Feature 20: Background Job Scheduler (Agenda)

**Feature Name:** Scheduled Background Jobs

**Description:** Agenda (MongoDB-backed job scheduler) runs four recurring jobs:
1. **check idle tickets** (every 5 min): Notifies agent/owner if a conversation has been idle >10 min (agent) or >30 min (owner)
2. **daily summary** (every 24h): Sends each business owner a push summary of yesterday's tickets/resolved count
3. **check subscription expiry** (every 12h): Alerts owners 7 days, 1 day before expiry and on expiry
4. **monitor go online request** (one-shot, 30 min): Checks if an agent came online after an "alert" was sent; notifies owner if they still haven't

**Files Responsible:** [`agenda.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/agenda.js)

**Dependencies Used:** `agenda`

---

### Feature 21: Auto-Resolve Engine

**Feature Name:** Stale Conversation Auto-Resolver

**Description:** Every 20 seconds, the server checks for `in_progress` conversations not updated in the last 60 seconds. If the last message was from an AI, it auto-resolves as `ai_resolved`. If from an agent/owner, as `human_resolved`.

**Business Purpose:** Prevents conversation queues from filling up with abandoned chats. Keeps metrics accurate.

**Files Responsible:** [`autoResolve.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/autoResolve.js)

---

### Feature 22: Plan Management (Free / Pro)

**Feature Name:** Freemium Plan System

**Description:** Free plan: 100 conversations max, 1 domain. Pro plan: unlimited conversations, 10 domains, website scraping access. Conversation counts enforced per chat request.

**Technical Implementation:** `business.conversationCount >= business.conversationLimit` check in `handleChat()` returns `403` with an upgrade prompt. `upgradePlan` endpoint sets `plan: 'pro'` and `conversationLimit: 999999`.

**Files Responsible:** [`businessController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/businessController.js), [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js#L165-L169)

**API Endpoints Used:** `POST /api/business/upgrade`

**Note:** There is no payment processor integration. Upgrades are manual or can be triggered via the Super Admin panel. **This is a gap** — billing is not implemented end-to-end.

---

### Feature 23: Super Admin Control Panel

**Feature Name:** Platform-Level Super Admin Dashboard

**Description:** A separate, fully isolated admin interface at `/super-admin/dashboard` with 7 sections: Overview, Business Owners, Support Agents, Conversations, Subscriptions, Notifications, Settings.

**Technical Implementation:**
- Super Admin is a hardcoded `.env` credential (not a DB record). Login creates a JWT signed with a separate `SUPER_ADMIN_JWT_SECRET`
- `superAdminMiddleware.js` verifies this separate token on all `/api/super-admin` routes
- Can block/unblock businesses and agents, update plans, delete records
- Overview shows 30-day chart data (new businesses + new conversations per day)
- CSV export for businesses, agents, conversations, subscriptions, notifications, settings via dedicated endpoints
- Password update: new password is bcrypt-hashed and stored in `PlatformConfig`
- Maintenance mode: single toggle in `PlatformConfig.maintenanceMode` that causes all chat requests to return `503`

**Files Responsible:** [`superAdminController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/superAdminController.js), [`SAOverview.jsx`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/client/src/features/superadmin/ui/components/SAOverview.jsx)

**Database Models Used:** `Business`, `User`, `Conversation`, `PlatformConfig`, `Notification`

---

### Feature 24: "Go Online" Alert for Offline Agents

**Feature Name:** Owner-to-Agent Nudge System

**Description:** If agents are offline and tickets are waiting, the owner can send a "Go Online" push notification to specific agents or all offline agents at once.

**Technical Implementation:**
- 10-minute cooldown per individual agent; 15-minute cooldown for bulk notifications
- Agenda schedules a follow-up job 30 minutes later: if the agent still hasn't come online, the owner receives a push notification alerting them
- When the agent does come online and `pendingGoOnlineRequest` was true, a "✅ Agent Name is now online" push is sent to the owner

**Files Responsible:** [`agentController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/agentController.js#L382-L478)

**API Endpoints Used:** `POST /api/agents/:id/notify`, `POST /api/agents/notify-all`

---

### Feature 25: Email Templates (Resend)

**Feature Name:** Transactional Email System

**Description:** Three HTML email templates delivered via Resend API: OTP verification, owner welcome, and agent invitation (with temporary password).

**Technical Implementation:** Templates are inline-styled HTML functions in `email.js`. `sendEmail()` accepts `{ email, type, data }` and calls the appropriate template function. Non-production environments continue even if email fails (graceful degradation).

**Files Responsible:** [`email.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/email.js)

**Dependencies Used:** `resend`

---

### Feature 26: In-Memory Response Cache

**Feature Name:** Business Config Cache

**Description:** A custom TTL-based in-memory cache (Node.js `Map`) that stores business configuration by API key for 1 hour, reducing MongoDB lookups on every chat message.

**Technical Implementation:** `cache.set(key, value, ttl)` stores with expiry timestamp. `cache.get(key)` checks expiry before returning. `cache.del(key)` is called whenever the business is updated, ensuring fresh data on next request.

**Files Responsible:** [`cache.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/utils/cache.js)

---

### Feature 27: Agent Profile & Photo Upload

**Feature Name:** Agent Profile Management

**Description:** Agents can set a display name, role title, and upload a profile photo. Photos are uploaded to ImageKit CDN if credentials are present, or stored as base64 data URLs in development as a fallback.

**Files Responsible:** [`agentController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/agentController.js#L116-L172)

**Dependencies Used:** `@imagekit/nodejs`, `multer`

**API Endpoints Used:** `PUT /api/agents/profile`

---

### Feature 28: Rate Limiting

**Feature Name:** API Rate Limiter

**Description:** All `/api/` routes are rate-limited to configurable maximums (default 100 requests per 15-minute window) using `express-rate-limit`.

**Technical Implementation:** `MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100`, `WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000`. Standard and modern headers returned. Custom error message returned on limit breach.

**Files Responsible:** [`server.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/server.js#L62-L73)

**Dependencies Used:** `express-rate-limit`

---

### Feature 29: Maintenance Mode

**Feature Name:** Platform Maintenance Toggle

**Description:** Super Admin can toggle `maintenanceMode` in `PlatformConfig`. When enabled, all `POST /api/chat/message` requests return `503 Service Unavailable` with a maintenance message.

**Files Responsible:** [`chatController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/chatController.js#L150-L157), [`superAdminController.js`](file:///Users/ajinkyasaivar/Ajinkya%20Developer/SupportBotAI/backend/controllers/superAdminController.js)

**Database Models Used:** `PlatformConfig`

---

### Feature 30: Public Marketing Pages

**Feature Name:** Public Website (Landing, Product, Pricing, Docs)

**Description:** Four public-facing pages accessible without authentication: `Home`, `Product`, `Pricing`, `Docs`.

**Files Responsible:** `/client/src/features/public/ui/pages/`

**Note:** These files were not individually read during analysis; their existence is confirmed by the routing in `App.jsx`.

---

# 5. Technology Stack Analysis

## Frontend

| Technology | Version | What It Is | Why Chosen | How Used |
|---|---|---|---|---|
| **React** | 19.2.5 | UI component library | Latest stable; concurrent features | All UI components, pages, routing |
| **Vite** | 8.0.10 | Build tool | Extremely fast HMR and build; native ESM | Dev server with API proxy; production bundling with `esbuild` minification |
| **Redux Toolkit** | 2.11.2 | State management | Opinionated Redux; reduces boilerplate | `authSlice` (JWT user state), `businessSlice` (business config state) |
| **React Router DOM** | 7.14.2 | Client-side routing | De-facto standard | SPA routing with protected routes and nested routes (super admin) |
| **Framer Motion** | 12.38.0 | Animation library | Declarative, physics-based animations | Page transitions, modal animations, widget animations |
| **Socket.IO Client** | 4.8.3 | WebSocket client | Matches server version; auto-reconnect | Live dashboard, typing indicators, real-time messaging |
| **Axios** | 1.15.2 | HTTP client | Interceptors, better error handling than fetch | All API calls from frontend |
| **React Hot Toast** | 2.6.0 | Toast notifications | Lightweight, easy customization | Success/error toasts across the app |
| **Recharts** | 3.8.1 | Chart library | React-native, responsive, composable | Analytics bar/line charts, overview stats |
| **Lucide React** | 1.12.0 | Icon library | Tree-shakeable SVG icons | All dashboard and UI icons |
| **React Icons** | 5.6.0 | Extended icon library | Access to Font Awesome, Bootstrap Icons | Additional icons not in Lucide |
| **React Markdown** | 10.1.0 | Markdown renderer | Renders AI responses with formatting | Chat message rendering |
| **@react-oauth/google** | 0.13.5 | Google OAuth library | Simplifies Google login flow | Google Sign-In button |

**State Management:** Redux Toolkit with two slices. `authSlice` stores user object (persisted to `localStorage`). `businessSlice` stores business configuration.

**Styling:** Vanilla CSS with a custom design system in `index.css` (9.6KB). Component-level inline styles and class-based CSS.

**Build Optimization:** Manual chunk splitting in `vite.config.js` separating `vendor` (React), `redux`, `ui` (Framer Motion, icons, charts), `network` (Axios, Socket.IO).

## Backend

| Technology | Version | What It Is | Why Chosen | How Used |
|---|---|---|---|---|
| **Node.js** | Runtime | JavaScript runtime | Non-blocking I/O; same language as frontend | All backend logic |
| **Express** | 5.2.1 | Web framework | Minimal, flexible; Express 5 is latest | HTTP routing, middleware, API handling |
| **Mongoose** | 9.6.0 | MongoDB ODM | Schema validation, middleware hooks, populate | All database interactions |
| **Socket.IO** | 4.8.3 | Real-time library | Bidirectional events; room management | Live chat, presence, notifications |
| **MistralAI SDK** | 2.2.1 | AI provider client | Fast, affordable LLM; strong instruction following | Chat, title generation, issue summary, agent suggestion |
| **Agenda** | 5.0.0 | Job scheduler | MongoDB-backed; survives restarts | Periodic jobs, delayed jobs |
| **Puppeteer-core** | 21.0.0 | Headless browser | JS-rendered page support | Website scraping |
| **@sparticuz/chromium** | 119.0.0 | Serverless Chrome | Runs on Render/Lambda without system Chrome | Production headless browser |
| **Cheerio** | 1.0.0 | HTML parser | Fast server-side jQuery for static pages | Extracting text from scraped pages |
| **Nodemailer** | 8.0.7 | Email (listed) | Not used in primary flow (Resend is used) | **Appears unused in current code** |
| **Resend** | 6.12.3 | Email API | Reliable deliverability; simple API | OTP emails, welcome emails, agent invitations |
| **web-push** | 3.6.7 | Push notification library | W3C Push API standard; VAPID support | Browser push notifications |
| **@imagekit/nodejs** | 7.5.0 | CDN SDK | Fast global CDN; transformation API | Logo and avatar uploads |
| **bcryptjs** | 3.0.3 | Password hashing | Industry standard for password security | Hashing passwords, OTP-like comparisons |
| **jsonwebtoken** | 9.0.3 | JWT library | Stateless auth tokens | Generating/verifying auth tokens |
| **express-rate-limit** | 7.5.1 | Rate limiter | Configurable, standard headers | API abuse prevention |
| **multer** | 2.1.1 | File upload middleware | Memory storage for CDN pipeline | Image uploads (logos, avatars) |
| **cors** | 2.8.6 | CORS middleware | Cross-origin request handling | Open CORS for widget embedding |
| **dotenv** | 17.4.2 | Environment config | Industry standard | Loading `.env` variables |
| **moment-timezone** | 0.6.2 | Date/time library | Listed as dependency; **appears unused** in reviewed code | Potentially used in unreached code paths |
| **googleapis** | 171.4.0 | Google APIs client | Listed; OAuth also uses google-auth-library | **Potentially unused** (google-auth-library handles OAuth) |
| **node-cron** | 4.2.1 | Cron scheduler | Listed; Agenda is used instead | **Potentially redundant** with Agenda |
| **lucide-react** | 1.14.0 (backend) | React icons | **Listed in backend `package.json`** — this is clearly incorrect; should only be in frontend | **Appears to be a mistake** |

## Database

| Item | Details |
|---|---|
| **Database** | MongoDB (Atlas — cloud-hosted) |
| **ODM** | Mongoose 9.6.0 |
| **Collections** | User, Business, Conversation, Notification, PlatformConfig, PushSubscription, PushNotificationLog, agendaJobs (Agenda internal) |

## Infrastructure

| Item | Details |
|---|---|
| **Frontend Hosting** | Vercel (confirmed via `vercel.json` and hardcoded Render URL in rewrites) |
| **Backend Hosting** | Render.com (confirmed via `vercel.json` rewrite to `https://supportbotai-szu0.onrender.com`) |
| **CDN** | ImageKit (for logos and profile photos) |
| **Email** | Resend |
| **Database** | MongoDB Atlas |

---

# 6. Dependency Analysis

## Backend Dependencies

| Package | Purpose | Where Used | Criticality |
|---|---|---|---|
| `@imagekit/nodejs` | Image CDN upload | `businessController.js`, `agentController.js` | Medium |
| `@mistralai/mistralai` | AI chat, title gen, issue summary | `chatController.js` | **Critical** |
| `@sparticuz/chromium` | Serverless Chrome binary | `scraper.js` | High (production scraping) |
| `agenda` | Background job scheduler | `agenda.js`, `agentController.js` | High |
| `axios` | HTTP requests | `authController.js` (Google OAuth), `scraper.js` | High |
| `bcryptjs` | Password hashing/comparison | `authController.js`, `superAdminController.js`, `User.js` | **Critical** |
| `cheerio` | HTML parsing | `scraper.js` | Medium |
| `cors` | CORS headers | `server.js` | **Critical** |
| `dotenv` | Environment config | `server.js` | **Critical** |
| `express` | HTTP framework | `server.js`, all routes | **Critical** |
| `express-rate-limit` | Rate limiting | `server.js` | High |
| `google-auth-library` | Google OAuth verification | `authController.js` | Medium |
| `googleapis` | Google API client | Listed; not directly used in reviewed code | **Potentially unused** |
| `jsonwebtoken` | JWT sign/verify | `authController.js`, `superAdminController.js` | **Critical** |
| `lucide-react` | React icon library | ❌ Listed in backend — **should not be here** | Mistake |
| `moment-timezone` | Timezone-aware dates | Not found in reviewed code | **Potentially unused** |
| `mongoose` | MongoDB ODM | All models and controllers | **Critical** |
| `multer` | File upload parsing | `businessController.js`, `agentController.js` | High |
| `node-cron` | Cron scheduler | Not used (Agenda used instead) | **Potentially redundant** |
| `nodemailer` | SMTP email | Not used (Resend used instead) | **Potentially unused** |
| `puppeteer-core` | Headless browser | `scraper.js` | High |
| `resend` | Email delivery API | `email.js` | High |
| `socket.io` | WebSocket server | `server.js`, `socket.js` | **Critical** |
| `web-push` | Browser push notifications | `pushService.js` | High |

## Frontend Dependencies

| Package | Purpose | Criticality |
|---|---|---|
| `react`, `react-dom` | Core UI framework | **Critical** |
| `@reduxjs/toolkit`, `react-redux` | State management | **Critical** |
| `react-router-dom` | Client routing | **Critical** |
| `axios` | HTTP API calls | **Critical** |
| `socket.io-client` | Real-time communication | **Critical** |
| `@react-oauth/google` | Google Sign-In | High |
| `framer-motion` | Animations | Medium |
| `lucide-react` | Icons | Medium |
| `react-icons` | Extended icons | Low |
| `react-hot-toast` | Toast notifications | Medium |
| `react-markdown` | Markdown rendering | Medium |
| `recharts` | Charts | Medium |

## Development Dependencies

| Package | Purpose |
|---|---|
| `nodemon` | Auto-restart server on save |
| `vite` | Build tool and dev server |
| `@vitejs/plugin-react` | Vite React plugin |
| `esbuild` | Fast JS minifier |
| `eslint` + plugins | Code linting |
| `@types/react`, `@types/react-dom` | TypeScript type hints for VS Code |

---

# 7. Frontend Architecture

## Folder Structure

```
client/src/
├── app/
│   ├── App.jsx              # Root routing component
│   └── store/
│       └── store.js         # Redux store configuration
├── features/
│   ├── auth/
│   │   ├── state/
│   │   │   └── authSlice.js # Redux auth slice
│   │   └── ui/
│   │       └── pages/       # Login, Signup, ForgotPassword
│   ├── dashboard/
│   │   ├── state/
│   │   │   └── businessSlice.js # Redux business slice
│   │   └── ui/
│   │       ├── pages/       # Dashboard, AdminPanel, UpgradePage
│   │       └── components/  # 15 dashboard components
│   ├── superadmin/
│   │   └── ui/
│   │       ├── pages/       # SuperAdminDashboard
│   │       └── components/  # 9 super admin panel components
│   ├── widget/
│   │   └── ui/
│   │       └── pages/       # ChatWidgetPage (36KB)
│   └── public/
│       └── ui/
│           └── pages/       # Home, Product, Pricing, Docs
├── shared/
│   ├── components/          # ProGate.jsx
│   ├── hooks/               # usePlan.js, usePushNotifications.js
│   ├── services/            # config.js, socket.js, useSound.js
│   └── ui/
│       └── components/      # Navbar
└── index.css                # Global design system (9.6KB)
```

## Architecture Pattern

The frontend follows a **Feature-Sliced Design (FSD)** pattern — each major feature (`auth`, `dashboard`, `superadmin`, `widget`) is self-contained with its own `state/` and `ui/` layers. Cross-cutting concerns live in `shared/`.

## Component Structure

**Dashboard Components (15 total):**
- `Dashboard.jsx` (28KB) — main container with socket listeners and conversation state
- `Overview.jsx` (26KB) — business stats, conversation list overview
- `Conversations.jsx` (27KB) — full inbox with filtering and live updates
- `AgentDashboard.jsx` (45KB — largest file) — agent console with real-time ticket management
- `Training.jsx` (24KB) — knowledge base editor + URL scraper
- `Appearance.jsx` (21KB) — brand customization editor
- `TeamMembers.jsx` (30KB) — agent management UI
- `Notifications.jsx` (30KB) — notification center
- `NotificationBell.jsx` (12KB) — header bell with badge count
- `Analytics.jsx` (15KB) — charts and metrics
- `Integration.jsx` (13KB) — script tag generator and instructions
- `Profile.jsx` (25KB) — agent profile editor with photo upload
- `Sidebar.jsx` (11KB) — navigation sidebar
- `TicketCard.jsx` (10KB) — reusable ticket display card
- `SystemSettings.jsx` (2KB) — minimal system settings

## State Management

- **Redux**: Persists auth token and user data in `localStorage`. Business config stored in Redux for cross-component access.
- **Local State**: Each component manages its own UI state (modals, loading, filters) with `useState` and `useEffect`.
- **Socket.IO**: The socket connection in `shared/services/socket.js` is a singleton. Socket events drive real-time UI updates directly in component state.

## Custom Hooks

- `usePushNotifications(user)` — Registers service worker, subscribes to push, manages permission prompt timing (3-day cooldown via localStorage)
- `usePlan(business)` — Returns `{ isPro: bool }` for feature gating
- `useSound` (in services) — Manages sound effects for notification types

---

# 8. Backend Architecture

## Folder Structure

```
backend/
├── server.js              # Entry point: Express setup, CORS, rate limiting, route mounting, Socket.IO init
├── config/
│   ├── db.js              # MongoDB connection
│   └── validateEnv.js     # Startup env validation (fails fast)
├── controllers/
│   ├── authController.js  # Register, login, Google OAuth, OTP, password management
│   ├── businessController.js # Business CRUD, logo upload, scrape-and-train, plan upgrade
│   ├── chatController.js  # Core AI engine, escalation, widget config, conversation status
│   ├── agentController.js # Agent CRUD, profile, join conversation, resolve, notify
│   ├── conversationController.js # Conversation listing, filtering
│   ├── notificationController.js # In-app notifications, push subscriptions
│   ├── profileController.js # User profile (lightweight)
│   └── superAdminController.js # Full platform management
├── middleware/
│   ├── authMiddleware.js   # JWT verification, attaches req.user
│   └── superAdminMiddleware.js # Super admin token verification
├── models/
│   ├── User.js            # User schema + bcrypt hooks
│   ├── Business.js        # Business + API key + appearance + FAQs + notifications
│   ├── Conversation.js    # Messages + status + routing + resolution metadata
│   ├── Notification.js    # In-app notification with broadcast and read tracking
│   ├── PlatformConfig.js  # Single-document platform settings
│   ├── PushSubscription.js # Browser push subscription endpoints
│   └── PushNotificationLog.js # Push delivery history
├── routes/
│   ├── authRoutes.js
│   ├── businessRoutes.js
│   ├── chatRoutes.js
│   ├── agentRoutes.js
│   ├── conversationRoutes.js
│   ├── notificationRoutes.js
│   ├── profileRoutes.js
│   └── superAdminRoutes.js
├── utils/
│   ├── socket.js          # Socket.IO event handlers (439 lines)
│   ├── agenda.js          # Background job definitions and scheduling
│   ├── autoResolve.js     # Stale conversation resolver (runs every 20s)
│   ├── routing.js         # Workload-aware ticket routing engine
│   ├── pushService.js     # Web Push delivery with rate limiting and preferences
│   ├── email.js           # Resend email templates and delivery
│   ├── scraper.js         # Puppeteer + Cheerio web crawler
│   ├── cache.js           # Custom TTL in-memory cache
│   └── imagekit.js        # ImageKit SDK initialization
└── public/
    └── widget.template.js # Embeddable widget script (281 lines)
```

## Architecture Patterns

- **MVC**: Clear separation between Models (Mongoose), Controllers (business logic), and Routes (routing)
- **Middleware Chain**: `protect` middleware injects `req.user` on protected routes. `req.io` is injected globally for all controllers to emit Socket.IO events
- **Utility Pattern**: Cross-cutting utilities (`cache`, `routing`, `pushService`, `email`) are isolated modules with single responsibilities
- **Singleton Services**: `agenda`, `cache`, and Socket.IO `io` are initialized once and passed/required throughout
- **Fail-Fast Startup**: `validateEnv.js` checks all required environment variables before Express starts; calls `process.exit(1)` if any are missing

## Error Handling

- Global Express error handler at the bottom of `server.js` catches unhandled exceptions
- Per-controller try/catch with `res.status(500).json({ message: error.message })` pattern
- Graceful email failure in development (logs warning but doesn't fail the request)
- Dead push subscriptions auto-deactivated on 410/404 response codes

---

# 9. API Documentation

## Authentication Routes (`/api/auth`)

| Method | Route | Auth | Purpose | Request Body | Response |
|---|---|---|---|---|---|
| POST | `/api/auth/register` | None | Create account + business | `{ name, email, password, plan }` | `{ _id, name, email, role, token }` |
| POST | `/api/auth/login` | None | Log in | `{ email, password }` | `{ _id, name, email, role, ownerId, notificationPreferences, token }` |
| POST | `/api/auth/google` | None | Google OAuth | `{ idToken, accessToken, plan }` | Same as login |
| GET | `/api/auth/me` | Bearer JWT | Get current user | — | User object |
| POST | `/api/auth/forgot-password` | None | Send OTP email | `{ email }` | `{ message }` |
| POST | `/api/auth/verify-otp` | None | Verify OTP | `{ email, otp }` | `{ success: true }` |
| POST | `/api/auth/reset-password` | None | Reset password | `{ email, otp, newPassword }` | `{ message, _id, name, email, role, token }` |
| PUT | `/api/auth/change-password` | Bearer JWT | Change password | `{ oldPassword, newPassword }` | `{ message }` |

## Business Routes (`/api/business`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/business` | Bearer JWT | Get business settings and config |
| PUT | `/api/business` | Bearer JWT | Update name, knowledge, FAQs, appearance |
| GET | `/api/business/stats` | Bearer JWT | Analytics stats |
| POST | `/api/business/scrape` | Bearer JWT (Pro only) | Scrape website to train AI |
| POST | `/api/business/upgrade` | Bearer JWT | Upgrade to Pro plan |
| POST | `/api/business/upload-logo` | Bearer JWT | Upload company logo to ImageKit |
| GET | `/api/business/notifications` | Bearer JWT | Get in-dashboard notifications |
| PUT | `/api/business/notifications/read` | Bearer JWT | Mark notifications as read |

## Chat Routes (`/api/chat`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/chat/config/:apiKey` | None (domain check) | Widget branding config |
| POST | `/api/chat/message` | None (API key) | Send message, get AI response |
| POST | `/api/chat/suggest` | Bearer JWT | Get AI reply suggestion for agent |
| GET | `/api/chat/widget-conversation/:id` | None | Get conversation state for widget |
| POST | `/api/chat/update-status` | None | Update conversation status |

## Agent Routes (`/api/agents`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/agents` | Bearer JWT (owner) | Add new agent |
| GET | `/api/agents` | Bearer JWT (owner) | List all agents with stats |
| DELETE | `/api/agents/:id` | Bearer JWT (owner) | Delete an agent |
| PUT | `/api/agents/profile` | Bearer JWT | Agent updates their own profile |
| PUT | `/api/agents/availability` | Bearer JWT | Update availability status |
| GET | `/api/agents/stats` | Bearer JWT | Agent's own dashboard stats |
| PUT | `/api/agents/join/:id` | Bearer JWT | Agent joins a conversation (atomic) |
| PUT | `/api/agents/resolve/:id` | Bearer JWT | Agent resolves a conversation |
| POST | `/api/agents/:id/notify` | Bearer JWT | Notify specific offline agent |
| POST | `/api/agents/notify-all` | Bearer JWT | Notify all offline agents |

## Conversation Routes (`/api/conversations`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| GET | `/api/conversations` | Bearer JWT | List conversations with filtering |

## Notification Routes (`/api/notifications`)

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/notifications/broadcast-owners` | Super Admin | Broadcast to all owners |
| POST | `/api/notifications/target-owner` | Super Admin | Target specific owner |
| POST | `/api/notifications/send-agents` | Bearer JWT (owner) | Send to own agents |
| GET | `/api/notifications/my` | Bearer JWT | Get user's notifications |
| PUT | `/api/notifications/:id/read` | Bearer JWT | Mark as read |
| PUT | `/api/notifications/read-all` | Bearer JWT | Mark all as read |
| GET | `/api/notifications/history` | Super Admin | Global notification history |
| GET | `/api/notifications/vapid-public-key` | None | Get VAPID public key |
| POST | `/api/notifications/subscribe` | Optional JWT | Subscribe to push |
| POST | `/api/notifications/unsubscribe` | None | Unsubscribe push |
| PUT | `/api/notifications/preferences` | Bearer JWT | Update notification preferences |
| POST | `/api/notifications/test-push` | Bearer JWT | Send test push notification |

## Super Admin Routes (`/api/super-admin`)

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/super-admin/login` | Super admin login |
| GET | `/api/super-admin/overview/stats` | Platform stats |
| GET | `/api/super-admin/overview/activity` | Recent platform activity |
| GET | `/api/super-admin/overview/chart` | 30-day chart data |
| GET | `/api/super-admin/businesses` | All businesses |
| GET | `/api/super-admin/businesses/:id` | Business details |
| PUT | `/api/super-admin/businesses/:id/plan` | Update business plan |
| PUT | `/api/super-admin/businesses/:id/block` | Toggle block business |
| DELETE | `/api/super-admin/businesses/:id` | Delete business |
| GET | `/api/super-admin/agents` | All agents |
| GET | `/api/super-admin/agents/:id` | Agent details |
| PUT | `/api/super-admin/agents/:id/block` | Toggle block agent |
| DELETE | `/api/super-admin/agents/:id` | Delete agent |
| GET | `/api/super-admin/conversations` | All conversations |
| GET | `/api/super-admin/conversations/:id` | Conversation details |
| GET | `/api/super-admin/subscriptions` | All subscriptions |
| GET | `/api/super-admin/settings` | Platform settings |
| PUT | `/api/super-admin/settings` | Update platform settings |
| PUT | `/api/super-admin/change-password` | Change super admin password |
| GET | `/api/super-admin/export/report` | Export master CSV report |
| GET | `/api/super-admin/export/businesses` | Export businesses CSV |
| GET | `/api/super-admin/export/agents` | Export agents CSV |
| GET | `/api/super-admin/export/conversations` | Export conversations CSV |
| GET | `/api/super-admin/export/subscriptions` | Export subscriptions CSV |
| GET | `/api/super-admin/export/notifications` | Export notifications CSV |
| GET | `/api/super-admin/export/settings` | Export settings CSV |
| GET | `/api/super-admin/public-config` | Public platform config |

---

# 10. Database Analysis

## User Collection

**Purpose:** Stores all platform users (owners, agents, and internal users)

| Field | Type | Description |
|---|---|---|
| `name` | String (required) | Display name |
| `email` | String (required, unique) | Login email |
| `password` | String (hashed) | bcrypt-hashed password (absent for Google-only users) |
| `googleId` | String | Google OAuth sub ID |
| `role` | Enum: `owner/agent/user` | Default: `owner` |
| `ownerId` | ObjectId → User | For agents: references their business owner |
| `profilePhoto` | String | URL or base64 data URI |
| `displayName` | String | Agent's display name |
| `roleTitle` | String | e.g., "Senior Support Agent" |
| `status` | Enum: `online/in_conversation/away/offline` | Real-time presence |
| `lastHeartbeat` | Date | Used by heartbeat monitor |
| `currentConversationId` | ObjectId → Conversation | Active conversation |
| `resetPasswordOTP` | String | 6-digit OTP |
| `resetPasswordExpires` | Date | OTP expiry |
| `isBlocked` | Boolean | Platform admin block |
| `notificationPreferences` | Object | 9 boolean flags + quiet hours |
| `lastNotifiedAt` | Date | Cooldown for go-online nudges |
| `pendingGoOnlineRequest` | Boolean | Tracks if nudge sent |

**Indexes:** Email (unique), implicit `_id`

**Relationships:** `ownerId` self-references User (agent → owner relationship)

---

## Business Collection

**Purpose:** Stores each business's configuration, knowledge base, and widget settings

| Field | Type | Description |
|---|---|---|
| `owner` | ObjectId → User (required) | Business owner |
| `name` | String (required) | Business name |
| `supportEmail` | String | Support contact email |
| `knowledge` | String | Full text knowledge base |
| `lastTrainedAt` | Date | When knowledge was last updated |
| `trainedFromUrl` | String | Website URL if scraped |
| `trainedPagesCount` | Number | Pages scraped |
| `apiKey` | String (unique) | Widget authentication key (`sb_...`) |
| `faqs` | Array of `{question, answer}` | Structured FAQ list |
| `appearance` | Object | `themeColor`, `botName`, `welcomeMessage`, `botAvatar`, `companyLogo`, `placeholderText` |
| `plan` | Enum: `free/pro` | Subscription tier |
| `planExpiryDate` | Date | Pro plan expiry (not actively enforced — partial implementation) |
| `conversationLimit` | Number | Max conversations (100 free, 999999 pro) |
| `conversationCount` | Number | Running total |
| `allowedDomains` | [String] | Auto-populated domain whitelist |
| `lastActiveAt` | Date | Last activity |
| `notifications` | Array | In-dashboard notification log |
| `isBlocked` | Boolean | Platform admin block |

**Relationships:** One-to-one with User (owner). One-to-many with Conversation.

---

## Conversation Collection

**Purpose:** Complete chat history with metadata, routing state, and resolution tracking

| Field | Type | Description |
|---|---|---|
| `business` | ObjectId → Business (required) | Which business this belongs to |
| `agent` | ObjectId → User | Assigned agent (if escalated) |
| `messages` | [MessageSchema] | Complete chat history |
| `status` | Enum: `ai_resolved/human_needed/in_progress/human_resolved` | Current state |
| `priority` | Enum: `low/medium/high` | Ticket urgency |
| `isAiActive` | Boolean | Whether AI is handling (default true) |
| `emotion` | Enum: `neutral/happy/frustrated/angry/urgent` | AI-detected sentiment |
| `intent` | String | AI-detected intent category |
| `userName` | String | Customer name (extracted or Anonymous) |
| `title` | String | AI-generated conversation title |
| `origin` | String | Website URL where chat started |
| `issueSummary` | String | AI-generated one-sentence problem description |
| `routingStatus` | Enum: `pending/assigned/holding/in_progress/resolved` | Ticket routing state |
| `assignedAgentId` | ObjectId → User | For direct DB lookups |
| `assignedAt` | Date | When agent was assigned |
| `resolvedBy` | String | Resolver ID |
| `resolvedByName` | String | Resolver name |
| `resolvedByType` | Enum: `agent/owner/ai` | Who resolved |
| `resolvedAt` | Date | Resolution timestamp |

**MessageSchema fields:** `role`, `content`, `timestamp`, `senderType`, `senderName`, `senderAvatar`, `senderRole`, `sender{ name, profilePhoto, userType }`

---

## Notification Collection

**Purpose:** In-app messaging between platform tiers (superadmin → owners, owners → agents)

| Field | Description |
|---|---|
| `senderId` | Who sent it |
| `senderRole` | `superadmin`, `owner`, or `agent` |
| `recipientId` | Null for broadcasts |
| `recipientRole` | `owner` or `agent` |
| `businessId` | For agent notifications (scoped to business) |
| `subject` / `message` | Notification content |
| `isBroadcast` | True if sent to all of a role |
| `readBy` | Array of User IDs who have read it |

---

## PlatformConfig Collection

**Purpose:** Single-document global platform configuration (Singleton pattern)

| Field | Default | Description |
|---|---|---|
| `platformName` | `'SupportBotAI'` | Platform branding name |
| `proPlanPrice` | `29` | Monthly price (display only — no payment processor) |
| `freeConversationLimit` | `100` | Applied to new free accounts |
| `proConversationLimit` | `999999` | Applied to pro accounts |
| `maintenanceMode` | `false` | Blocks all chat when enabled |
| `superAdminPasswordHash` | String | bcrypt hash of super admin password |
| `heroVideoUrl` | Google Drive URL | Landing page video |
| Social URLs | Strings | Twitter, LinkedIn, GitHub |

---

## PushSubscription Collection

**Purpose:** Stores browser push subscription endpoints for each user/session

| Field | Description |
|---|---|
| `userId` | User ID (null for guest sessions) |
| `sessionId` | Guest conversation ID |
| `userRole` | `owner`, `agent`, or `guest` |
| `subscription` | Full browser PushSubscription object with endpoint and keys |
| `browser` | User agent string |
| `deviceType` | `mobile` or `desktop` |
| `isActive` | False when subscription is dead (410 response) |

---

## PushNotificationLog Collection

**Purpose:** Audit trail for every push notification sent or failed

| Field | Description |
|---|---|
| `userId` | Target user |
| `type` | Notification type (new_ticket, assigned, etc.) |
| `title` | Notification title |
| `body` | Notification body |
| `data` | Additional payload |
| `status` | `sent` or `failed` |
| `error` | Error message if failed |
| `sentAt` | Timestamp |

---

## ER Relationships

```
User (owner) ──1:1──► Business
Business ──1:many──► Conversation
User (agent) ──many:many──► Conversation (via agent/assignedAgentId fields)
User ──1:many──► PushSubscription
User ──1:many──► PushNotificationLog
Business ──1:many──► Notification (via businessId)
User ──many:many──► Notification (via readBy array)
PlatformConfig ──Singleton──► (no relationships)
```

---

# 11. Authentication & Security Analysis

## How Authentication Works

1. **Owner/Agent Login:** POST credentials → server verifies bcrypt hash → signs JWT with `JWT_SECRET` → client stores token in Redux + localStorage
2. **Google OAuth:** Frontend gets Google credential → POST to `/api/auth/google` → server verifies via Google SDK → same JWT flow
3. **Request Auth:** Client sends `Authorization: Bearer {token}` header → `authMiddleware.protect` verifies JWT, fetches user, attaches to `req.user`
4. **Super Admin:** Separate `.env` credentials → JWT signed with `SUPER_ADMIN_JWT_SECRET` → verified by `superAdminMiddleware.js`
5. **Widget/Chat:** Uses API key in request body (not JWT) — no auth required for chat widget

## How Authorization Works

- **Role-based:** Controllers check `req.user.role` for owner vs agent operations
- **Resource scoping:** Agents can only access conversations belonging to their `ownerId`'s business
- **Agent operations:** `req.user.role === 'agent' ? req.user.ownerId : req.user._id` pattern used consistently to derive `ownerId`
- **Super Admin isolation:** Completely separate middleware chain and JWT secret

## Security Strengths

| Strength | Evidence |
|---|---|
| bcrypt with salt rounds 10 | `bcrypt.genSalt(10)` in User model pre-save hook |
| JWT expiry | `expiresIn: process.env.JWT_EXPIRES_IN || '30d'` |
| JWT secret length warning | `validateEnv.js` warns if JWT_SECRET < 32 chars |
| Rate limiting | 100 req/15min on all `/api` routes via `express-rate-limit` |
| Environment validation | Server refuses to start if required env vars missing |
| Account blocking | `isBlocked` check on login — blocked users get 403 |
| OTP expiry | 10-minute TTL on password reset OTPs |
| Push rate limiting | Max 10 push notifications per hour per user |
| Quiet hours | User-configurable push notification silent hours |
| Domain limiting | Widget domains auto-allowlisted with per-plan caps |

## Potential Improvements

| Issue | Description |
|---|---|
| Super admin hardcoded email in `.env` | No way to change email, only password via bcrypt in PlatformConfig |
| Plain password sent in agent email | Agent welcome email includes the plaintext temporary password — should force a first-login password change |
| Socket.IO CORS is `origin: '*'` | While intentional for widget compatibility, creates a broad attack surface |
| No HTTPS enforcement | No `helmet.js` or security headers beyond `Cross-Origin-Opener-Policy` |
| No refresh token system | JWTs are long-lived (30 days) with no refresh/rotation mechanism |
| No input sanitization | No explicit XSS sanitization on user-supplied content (MongoDB injection risk is lower with Mongoose, but HTML injection in AI responses is possible) |
| `lucide-react` in backend `package.json` | Dependency pollution; unclear if it actually gets installed/used |

---

# 12. AI Features Analysis

## Feature 1: Main AI Chat (`chatController.js`)

**Purpose:** Answer customer questions based on business knowledge

**Implementation:**
- Model: `mistral-large-latest` (configurable via `process.env.AI_MODEL`)
- Max tokens: 1024 (configurable via `process.env.AI_MAX_TOKENS`)
- System prompt dynamically built with: business name, knowledge base, structured FAQs, detected emotion, detected intent, visitor name, support email
- AI instructed to use confidence tags `[CONFIDENCE: High/Low]` as a machine-readable escalation signal
- History of previous messages included in each request (multi-turn conversation context)

**Prompt Engineering Highlights:**
- Emotion-conditional instructions: "If the user is angry, acknowledge their frustration with genuine empathy first"
- Visitor name acquisition: First reply asks for name naturally if unknown; never asks again
- Human-like instruction: "Sound like a warm, knowledgeable human — never robotic"
- Escalation transparency: Low confidence triggers "I've notified our support team" message

## Feature 2: Issue Summary Generation

**Purpose:** Generate a one-sentence summary of the customer's problem when escalating

**Model:** `mistral-small-latest` (cheaper, faster model used for this auxiliary task)

**Prompt:** System: "Summarize the user's support issue in one concise sentence (max 12 words)." User: Last 5 messages of conversation.

## Feature 3: Conversation Title Generation

**Purpose:** Auto-generate a descriptive 4-word title for each conversation

**Model:** `mistral-small-latest`

**Trigger:** When conversation has ≥2 messages and still has a default title

## Feature 4: AI Agent Suggestion Copilot

**Purpose:** Draft a reply for a human agent based on conversation context and knowledge base

**Model:** `mistral-small-latest`

**Prompt:** System prompt includes business name, knowledge base, FAQs, and conversation history. Instructs AI to "Suggest a perfect, human-like reply for the agent to send."

## AI Data Flow

```
Customer Message
      ↓
analyzeMessage() → { emotion, intent }
      ↓
extractNameFromMessage() → visitorName
      ↓
buildSystemPrompt(business, visitorName, emotion, intent)
      ↓
MistralAI API (mistral-large-latest)
      ↓
Parse [CONFIDENCE: High/Low] tag
      ↓
needsEscalation? → routeTicket() + push notifications
      ↓
Save to MongoDB (Conversation.messages)
      ↓
Emit via Socket.IO to dashboard
      ↓
Return to widget
```

---

# 13. Real-Time Features Analysis

## Socket.IO Architecture

The Socket.IO server runs on the same HTTP server as Express (shared port). The `io` object is:
1. Passed to `utils/socket.js` for event handler registration
2. Attached to every request as `req.io` via Express middleware
3. Passed to `utils/autoResolve.js` for event emission from background processes

## Room Structure

| Room Name | Who Joins | Events Emitted |
|---|---|---|
| `{ownerId}` (string) | Business owner | `new_ticket`, `update_conversation`, `new_message`, `ticket_resolved` |
| `owner_{ownerId}` | Owner + all their agents | `new_message`, `agent_joined`, `agent_status_changed`, `ticket_assigned`, `ticket_resolved` |
| `session_{conversationId}` | Widget user (customer) | `new_message`, `agent_joined`, `agent_typing`, `ai_toggled`, `ticket_resolved` |
| `user_{userId}` | Individual user (private) | `new_notification` |
| `agent_{agentId}` | Specific agent | `agent_assigned`, `agent_status_changed` |
| `business_{ownerId}_agents` | All agents of a business | `new_notification` (broadcasts) |
| `role_owner` | All business owners globally | `new_notification` (super admin broadcasts) |
| `role_superadmin` | Super admin | `agent_status_changed` |

## Real-Time Events

**Widget → Server:**
- `join_session(sessionId)` — Widget joins its conversation room

**Agent/Owner → Server:**
- `join_room({ role, userId, ownerId })` — Join appropriate rooms
- `send_message({ conversationId, content, senderType, ... })` — Send message (persisted + broadcast)
- `agent_heartbeat({ agentId })` — Keep agent status alive
- `typing({ conversationId, agentName })` — Typing indicator
- `resolve_ticket({ conversationId, resolvedBy, ... })` — Resolve conversation
- `toggle_ai({ conversationId, isAiActive })` — Toggle AI on/off
- `agent_status_change({ agentId, status, ownerId })` — Manual status change

**Server → Clients:**
- `new_ticket` — New escalated conversation created
- `new_message` — New message in conversation
- `update_conversation` — Conversation metadata updated
- `agent_joined` — Human agent took over
- `agent_typing` — Agent is typing
- `agent_status_changed` — Agent went online/offline/busy
- `ticket_resolved` — Conversation marked resolved
- `ticket_assigned` — Ticket assigned to specific agent
- `ai_toggled` — AI mode changed
- `new_notification` — In-app notification received
- `play_sound` — Sound trigger for audio alerts

## Presence Tracking

Agent presence is tracked via:
1. **Heartbeat**: `agent_heartbeat` event every ~30s from the agent's dashboard
2. **Server-side monitor**: `setInterval` in `server.js` checks for agents with stale heartbeats every 30s, marks offline
3. **Disconnect handler**: 5-second grace period on socket disconnect before marking offline

---

# 14. Video Calling System Analysis

**This project does NOT implement video calling.** There is no WebRTC code, no video stream handling, and no peer connection management anywhere in the codebase.

The communication system is entirely text-based, real-time messaging via Socket.IO between the chat widget and the agent dashboard.

---

# 15. Deployment Analysis

## Frontend — Vercel

- **Platform:** Vercel (confirmed by `client/vercel.json`)
- **Build command:** `npm run build` (Vite production build)
- **Output:** `dist/` directory
- **SPA Routing:** `"source": "/(.*)", "destination": "/index.html"` catches all routes for client-side routing
- **API Proxy:** `vercel.json` rewrites `/api/*` → `https://supportbotai-szu0.onrender.com/api/*` (avoids CORS complexity in production)
- **Widget.js Proxy:** `/widget.js` → Render backend

## Backend — Render.com

- **Platform:** Render (confirmed by hardcoded URL in `vercel.json`)
- **Start command:** `node server.js`
- **Instance type:** Web Service (single instance, no horizontal scaling configured)
- **Environment variables:** Set via Render dashboard

## Environment Variables Required

| Variable | Purpose |
|---|---|
| `PORT` | Server port |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRES_IN` | Token lifetime |
| `AI_PROVIDER` | Must be `mistral` |
| `MISTRAL_API_KEY` | MistralAI API key |
| `FRONTEND_URL` | Vercel frontend URL |
| `SERVER_BASE_URL` | Render backend URL (injected into widget.js) |
| `VAPID_PUBLIC_KEY` | Push notification public key |
| `VAPID_PRIVATE_KEY` | Push notification private key |
| `RESEND_API_KEY` | Email delivery key |
| `SUPER_ADMIN_EMAIL` | Super admin login email |
| `SUPER_ADMIN_PASSWORD` | Super admin default password |
| `SUPER_ADMIN_JWT_SECRET` | Separate JWT secret for super admin |
| `IMAGEKIT_PRIVATE_KEY` | CDN upload key |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `RATE_LIMIT_MAX_REQUESTS` | Optional rate limit override |
| `RATE_LIMIT_WINDOW_MS` | Optional rate limit window |

## Production Architecture Flow

```
Customer Browser                    Business Owner Browser
      ↓                                      ↓
Loads <script> from Vercel/Render    Loads React App from Vercel
      ↓                                      ↓
widget.js creates iframe              Redux loads JWT from localStorage
      ↓                                      ↓
iframe loads ChatWidgetPage.jsx       Socket.IO connects to Render
      ↓                                      ↓
POST /api/chat/message → Render       Renders live dashboard
      ↓
MistralAI API call
      ↓
MongoDB Atlas write
      ↓
Socket.IO → Owner dashboard
```

---

# 16. Scalability Review

## Current Architecture Strengths

| Aspect | Status |
|---|---|
| Stateless JWT auth | ✅ Scales horizontally |
| MongoDB Atlas | ✅ Managed, auto-scaling |
| ImageKit CDN | ✅ Global CDN for media |
| In-memory cache | ✅ Reduces DB reads for hot paths |
| Agenda on MongoDB | ✅ Jobs survive server restarts |

## Current Bottlenecks

| Bottleneck | Impact |
|---|---|
| **Single Render instance** | Single point of failure; no horizontal scaling; WebSocket sticky sessions would break if multiple instances added |
| **In-memory cache is per-process** | Cache doesn't share across multiple server instances — cache misses increase with horizontal scaling |
| **Socket.IO without Redis adapter** | Socket.IO rooms only work within a single process; multi-instance deployment would fail for real-time events |
| **Puppeteer memory usage** | Headless Chrome is memory-intensive; concurrent scraping jobs could crash the Render instance |
| **Single MongoDB URI** | No read replicas or connection pooling configuration seen in `db.js` |
| **autoResolve runs every 20s** | Multiple `setInterval` timers per process add up; potential for DB query pile-up under load |

## Recommendations

1. **Add Socket.IO Redis Adapter** when moving to multiple instances
2. **Replace in-memory cache with Redis** for shared, distributed caching
3. **Move Puppeteer scraping to a separate worker service** or serverless function
4. **Add MongoDB indexes** on frequently queried fields: `Conversation.status`, `Conversation.routingStatus`, `Conversation.business`, `User.ownerId + role`
5. **Implement a real payment processor** (Stripe) for plan upgrades instead of manual upgrades
6. **Add horizontal scaling** behind a load balancer when traffic grows

---

# 17. Code Quality Assessment

## Score: 7.5 / 10

| Dimension | Score | Evidence |
|---|---|---|
| **Code Organization** | 8/10 | Feature-based folder structure; clear MVC separation; utility isolation |
| **Naming Conventions** | 8/10 | Consistent camelCase; descriptive function names (`routeTicket`, `checkHoldingTickets`, `buildSystemPrompt`) |
| **Architecture Patterns** | 7/10 | Good MVC; Room-based Socket.IO; singleton cache — but no repository pattern, no service layer abstraction |
| **Reusability** | 7/10 | Utilities well-isolated; but some controllers are very large (superAdminController.js is 723 lines) |
| **Maintainability** | 7/10 | Named constants (no magic numbers), comments on complex logic, `validateEnv.js` makes config errors obvious |
| **Error Handling** | 6/10 | Consistent try/catch but no centralized error taxonomy; mix of `500` responses with varying message formats |
| **Security Practices** | 7/10 | bcrypt, JWT, rate limiting, env validation — but no helmet, no HTTPS enforcement, agent email includes plaintext password |
| **Dead Code / Dependencies** | 5/10 | `nodemailer`, `googleapis`, `node-cron`, `moment-timezone`, `lucide-react` (in backend) appear unused |
| **Testing** | 0/10 | No test files found anywhere in the codebase |
| **Documentation** | 7/10 | Good README; inline comments on complex sections; `validateEnv.js` as living docs |

**Key Positives:**
- `validateEnv.js` startup validation is a production-grade practice
- Atomic `findOneAndUpdate` for race condition prevention in ticket assignment
- Heartbeat + auto-offline system shows thoughtful systems design
- Custom TTL cache is simple and effective
- BFS crawler with deduplication and similarity threshold is sophisticated

**Key Gaps:**
- Zero automated tests
- Several unused dependencies
- Some very large files (AgentDashboard.jsx at 45KB; superAdminController.js at 723 lines) could be refactored

---

# 18. Engineering Level Assessment

## Overall Level: **Mid-to-Senior**

| Category | Level | Justification |
|---|---|---|
| **Backend Architecture** | Senior | Multi-tenant SaaS, Socket.IO rooms, heartbeat monitoring, background jobs, workload-aware routing, atomic DB operations |
| **Real-Time Systems** | Senior | Complex Socket.IO room topology, presence tracking, multi-party sync between widget/dashboard |
| **AI Integration** | Mid-Senior | Custom prompt engineering, confidence-based escalation, multi-call MistralAI flows |
| **Frontend Architecture** | Mid | Feature-sliced design, Redux Toolkit, custom hooks — but no TypeScript, no tests |
| **Database Design** | Mid | Appropriate schema design, embedded documents — but no explicit indexes defined, no transactions |
| **Security** | Mid | bcrypt, JWT, rate limiting — but several gaps (no helmet, no input sanitization, plaintext temp passwords) |
| **DevOps/Infrastructure** | Junior-Mid | Vercel + Render deployment is real and working, but no CI/CD, no Docker, no monitoring |
| **Testing** | Junior | None |
| **Browser APIs** | Senior | Service Workers, Web Push API, VAPID, PostMessage API — these are advanced browser APIs |
| **System Design** | Mid-Senior | Demonstrates thinking about race conditions, cooldowns, holding queues, auto-resolve |

**Why Mid-to-Senior and not Junior:**
- The ticket routing engine with workload awareness and race condition prevention (atomic findOneAndUpdate with routing status guards) is not something a junior would design
- The multi-room Socket.IO architecture with role-based and session-based rooms is thoughtfully designed
- The confidence-tag system for AI escalation is custom prompt engineering, not a tutorial pattern
- The heartbeat + auto-offline system shows understanding of distributed systems concepts
- Web Push with VAPID, service workers, and rate limiting per user is genuinely advanced

**Why not full Senior:**
- No automated tests anywhere
- Several unused dependencies suggest the project evolved quickly without cleanup
- Some files are very large and could benefit from further decomposition
- No TypeScript
- No observability/logging infrastructure

---

# 19. Resume Ready Content

## Resume Project Description

**SupportBotAI | Full-Stack B2B SaaS Platform | MistralAI · Node.js · React · Socket.IO · MongoDB**

Built a production-deployed AI customer support platform that enables businesses to deploy branded chatbots via a single script tag, with real-time human handoff, background job scheduling, and browser push notifications.

## Resume Bullet Points

- Engineered a multi-tenant AI chat engine using MistralAI with custom prompt engineering, confidence-based escalation detection, and automatic conversation title/summary generation
- Implemented a real-time multi-party messaging system using Socket.IO with a 7-room topology to synchronize messages between embeddable widgets, business dashboards, and agent consoles
- Built a workload-aware ticket routing engine with atomic MongoDB operations to prevent race conditions when multiple agents compete for the same ticket
- Developed a website crawler using Puppeteer + Cheerio with JavaScript-rendering fallback, deduplication logic, and an 85% similarity threshold to auto-populate AI knowledge bases
- Integrated Web Push Notifications (VAPID/PWA) with per-user preference filtering, quiet hours support, rate limiting (10/hour), and dead subscription auto-cleanup
- Designed a background job scheduler (Agenda) with 4 recurring jobs: idle ticket alerts, daily summaries, subscription expiry warnings, and go-online monitoring
- Created an embeddable JavaScript widget served via server-side URL injection with CSS animations, unread badge tracking, and PostMessage API cross-origin communication
- Deployed a three-tier RBAC system (owner, agent, superadmin) with separate JWT secrets, role-scoped data access, and a fully isolated super admin control panel
- Won Creative Excellence Award at Sheryians Cohort Hackathon — built in 48 hours as a team of 4

## ATS-Optimized Description

AI-powered customer support SaaS platform. Node.js, Express, MongoDB, React, Redux Toolkit, Socket.IO, MistralAI, Web Push API, Puppeteer, Vite. Real-time chat, ticket routing, push notifications, background jobs. Deployed on Vercel + Render.

## Technical Achievement Highlights

1. **Custom AI Escalation System:** Designed a confidence-tagging protocol where the AI prefixes replies with `[CONFIDENCE: High/Low]` that drives automated escalation — a non-trivial prompt engineering + backend parsing pattern
2. **Atomic Race Condition Prevention:** Used `findOneAndUpdate` with routing status state machine guards to prevent two agents from simultaneously claiming the same ticket
3. **Puppeteer on Serverless:** Successfully configured headless Chrome for production deployment on Render using `@sparticuz/chromium` with platform-specific binary selection
4. **Multi-Party Real-Time Sync:** Designed a socket room architecture that synchronizes state across three distinct consumers (widget, owner dashboard, agent console) simultaneously

---

# 20. Portfolio Description

## Short Description (50 words)

SupportBotAI is a B2B SaaS platform that lets businesses deploy a branded AI chatbot on their website with a single script tag. It features real-time human handoff, workload-aware ticket routing, browser push notifications, and a full super admin control panel. Built in 48 hours. Won hackathon Creative Excellence Award.

## Medium Description (150 words)

SupportBotAI is a production-deployed B2B SaaS customer support platform built with Node.js, React, Socket.IO, and MistralAI. Business owners register, train an AI on their knowledge base (via text or automated website scraping), customize their widget's branding, and embed it on any website with a single `<script>` tag.

The AI handles customer queries 24/7, detecting emotion and intent, and automatically escalates to human agents when confidence is low. A real-time Socket.IO system synchronizes messages between the embedded widget, the business dashboard, and a dedicated agent console. Browser push notifications (VAPID/PWA) alert agents and owners even when offline.

The platform includes a Super Admin panel for platform-level management, background job scheduling with Agenda, workload-aware ticket routing with race condition prevention, and a comprehensive notification system spanning 4 tiers of delivery.

Deployed on Vercel (frontend) and Render (backend) with MongoDB Atlas.

## Long Description (300 words)

SupportBotAI is a full-stack, multi-tenant B2B SaaS platform that solves the "after-hours support" problem for small and medium businesses. It enables any business owner — regardless of technical ability — to deploy a branded, AI-powered customer support chatbot on their website in under 10 minutes.

**The Product Flow:** A business owner registers (email or Google OAuth), trains the AI by pasting their FAQ and business information or entering their website URL for automated crawling, customizes the widget's appearance (colors, name, logo), and copies a single `<script>` tag to their website. The widget appears immediately as an animated floating chat bubble. Customers can chat 24/7 and receive instant, contextually accurate answers.

**The AI Engine:** Powered by MistralAI's `mistral-large-latest` model, the system uses custom prompt engineering to inject the business's knowledge base and detected customer emotion/intent into every conversation. A confidence-tagging protocol (`[CONFIDENCE: High/Low]`) triggers automatic escalation when the AI is uncertain. Issue summaries and conversation titles are auto-generated using a secondary `mistral-small-latest` call.

**Real-Time Infrastructure:** A Socket.IO server with a 7-room topology enables simultaneous real-time communication between the embedded widget, the owner's dashboard, and individual agents. Typing indicators, live message delivery, agent join events, and ticket resolution all propagate instantly across all parties.

**Advanced Systems:** A workload-aware ticket routing engine uses atomic MongoDB operations to prevent race conditions. Web Push Notifications (VAPID/PWA) are delivered with user preference filtering, quiet hours support, and rate limiting. Background jobs (Agenda) handle idle ticket alerts, daily summaries, and subscription expiry warnings. An automated website crawler (Puppeteer + Cheerio) with deduplication and similarity-based filtering populates knowledge bases from any public website.

**Outcome:** Won Creative Excellence at the Sheryians Cohort Hackathon (48-hour build, team of 4). Deployed and production-ready.

---

# 21. LinkedIn Project Description

**🤖 SupportBotAI — AI Customer Support Platform**

Built a production-deployed B2B SaaS platform that lets businesses add a fully branded AI chatbot to their website with a single line of HTML.

🏆 **Won Creative Excellence** at the Sheryians Cohort Hackathon — built from scratch in 48 hours as a team of 4.

**What it does:**
✅ Train an AI on your business knowledge in minutes
✅ Auto-crawl your website to build the knowledge base
✅ Embed on any site with one `<script>` tag
✅ AI handles queries 24/7 — escalates angry/complex issues to human agents
✅ Agents take over seamlessly in real time
✅ Push notifications alert agents even when browser is closed

**Under the hood:**
→ MistralAI with custom prompt engineering + confidence-based escalation
→ Socket.IO with a 7-room topology for live three-party sync (widget ↔ dashboard ↔ agent)
→ VAPID Web Push (PWA) with per-user preferences and rate limiting
→ Workload-aware ticket routing with atomic DB operations (no race conditions)
→ Puppeteer website crawler with deduplication + 85% similarity threshold
→ Agenda background jobs: idle alerts, daily summaries, subscription expiry
→ Super Admin panel: platform-level control, CSV exports, maintenance mode

**Stack:** React 19 · Redux Toolkit · Node.js · Express 5 · MongoDB Atlas · Socket.IO · MistralAI · Web Push · Puppeteer · Vite · Vercel + Render

---

# 22. Technical Interview Preparation

---

**Q1: Explain how your AI escalation system works.**

**Question:** Walk me through how SupportBotAI decides when to escalate a conversation to a human agent.

**Ideal Answer:** The escalation system is multi-layered. First, `analyzeMessage()` uses keyword matching to detect emotion (angry/urgent) and intent (account_management, billing, technical_support). Second, the AI is instructed via the system prompt to prefix every reply with `[CONFIDENCE: High]` or `[CONFIDENCE: Low]`. The backend strips this tag and evaluates `needsEscalation = confidence === 'Low' || emotion === 'angry' || intent === 'account_management'`. When true, the conversation status changes to `human_needed`, an AI-generated issue summary is created, and `routeTicket()` is called to assign to the best available agent. The AI also sends a transparency message to the customer: "I've notified our support team..."

**Technical Explanation:** The confidence tag pattern is a form of chain-of-thought prompting — we're using a structured output format from the LLM as a machine-readable signal. This avoids the need for a separate classifier model.

---

**Q2: How does your ticket routing prevent race conditions?**

**Question:** If two agents click "Take Ticket" simultaneously, what happens?

**Ideal Answer:** The `joinConversation` REST endpoint uses `Conversation.findOneAndUpdate()` with a state guard in the query filter: `{ _id: conversationId, business: businessId }`. MongoDB's `findOneAndUpdate` is atomic — only one write can succeed at a time. The second agent's request would update the same document but we check the returned conversation to see if the agent field already exists. The routing engine similarly uses `{ routingStatus: { $in: ['pending', 'holding', 'unassigned'] } }` in the query to prevent assigning an already-assigning ticket.

**Technical Explanation:** We're using MongoDB's document-level atomic operations as a mutex. This is a classic optimistic locking pattern using state transitions as guards.

---

**Q3: Explain your Socket.IO room architecture.**

**Question:** How do you ensure a customer's message appears on both the agent's screen and the owner's dashboard?

**Ideal Answer:** We use multiple overlapping rooms. Every agent of a business joins `owner_{ownerId}` — a shared business room. The widget customer joins `session_{conversationId}`. When an agent sends a message via the `send_message` Socket.IO event, we broadcast to both `session_{conversationId}` (widget) and `owner_{ownerId}` (dashboard + all agents). This means the customer sees it immediately in their chat, and all business users see it in the dashboard simultaneously.

---

**Q4: How does your website scraper work in production?**

**Question:** Your scraper uses Puppeteer — how does that work on Render's serverless environment?

**Ideal Answer:** On production, I use `@sparticuz/chromium` which provides a pre-compiled, stripped-down version of Chrome binary compatible with serverless environments where you can't install system Chrome. The `getChromePath()` function detects `NODE_ENV === 'production'` and uses `await chromium.executablePath()`. On local development, it falls back to the system Chrome path. The scraper also tries Cheerio/Axios first (lightweight) and only falls back to Puppeteer if the page requires JavaScript rendering.

---

**Q5: How do your Web Push notifications work?**

**Question:** Explain how an agent receives a push notification even when their browser tab is closed.

**Ideal Answer:** We use the Web Push API with VAPID keys. When an agent logs in, their browser registers a service worker and subscribes to push with the server's VAPID public key. The subscription endpoint (a URL unique to that browser/device) is stored in our `PushSubscription` model. When we need to notify the agent, `pushService.sendNotification()` fetches all their active subscription endpoints and uses the `web-push` library to send to each one. The browser receives the push even when closed because the service worker runs independently of the tab. The service worker shows the notification and handles click actions.

---

**Q6: How did you implement the embeddable widget?**

**Question:** How does the single script tag create the full chat experience?

**Ideal Answer:** The `<script>` tag loads `/widget.js` from our server. The `widget.template.js` is a server-side template where `__SERVER_BASE_URL__` is replaced at request time with the actual backend URL. The script runs as an IIFE (Immediately Invoked Function Expression) to avoid global scope pollution. It: (1) fetches widget config from `/api/chat/config/{apiKey}` to get branding, (2) injects CSS with brand colors and animations, (3) creates a floating bubble `<div>` and a container `<div>`, (4) creates an `<iframe>` pointing to the React ChatWidgetPage, (5) uses PostMessage API for cross-origin communication between the iframe and parent page (open/close, unread count).

---

**Q7: What is your agent heartbeat system?**

**Question:** How do you keep agent status accurate in real time?

**Ideal Answer:** Agents send a `agent_heartbeat` Socket.IO event every 30 seconds from their dashboard. Each heartbeat updates `user.lastHeartbeat` in MongoDB. Two server-side monitors run: a 30-second `setInterval` in `server.js` that queries for agents with `lastHeartbeat < now - 60s` and marks them offline, and a 60-second monitor inside Socket.IO for stale agents (2-minute threshold). On socket disconnect, we wait 5 seconds before marking offline to allow for page refreshes. When an agent goes offline, we emit `agent_status_changed` to the owner dashboard and trigger `checkHoldingTickets()` to re-route any unassigned tickets.

---

**Q8: Explain your in-memory cache.**

**Question:** You mention an in-memory cache — what does it cache and why?

**Ideal Answer:** The cache stores business configuration (the `Business` document) keyed by API key. Every time a customer sends a chat message, we need the business's knowledge base, appearance settings, and plan tier. Without caching, every chat message would require a MongoDB query. With caching, we only hit MongoDB once per API key per hour. The TTL is 1 hour. Whenever a business owner updates their settings, we call `cache.del(business.apiKey)` to invalidate immediately. The cache is a simple Node.js `Map` with expiry timestamps — not Redis, so it doesn't persist across server restarts or scale horizontally.

---

**Q9: How does the Agenda job scheduler work?**

**Question:** How do you handle background tasks like daily summaries and idle ticket alerts?

**Ideal Answer:** I used Agenda, which is a MongoDB-backed job scheduler. Jobs are defined and stored in a `agendaJobs` MongoDB collection. This means jobs survive server restarts. I defined 4 jobs: `check idle tickets` (every 5 minutes), `daily summary` (daily), `check subscription expiry` (every 12 hours), and `monitor go online request` (one-shot, scheduled 30 minutes from now). The scheduler connects to the same MongoDB instance, which means we don't need a separate Redis or queue service.

---

**Q10: How does the Go-Online nudge system work?**

**Question:** If an owner sees that agents are offline and tickets are waiting, what happens when they click "Notify"?

**Ideal Answer:** The owner clicks "Notify Agent" → `POST /api/agents/:id/notify` → server checks 10-minute cooldown (using `lastNotifiedAt`) → sends Web Push notification to all the agent's devices with action buttons ("Go Online Now" / "Dismiss") → sets `pendingGoOnlineRequest: true` on the agent → schedules an Agenda job 30 minutes out. After 30 minutes, if the agent still hasn't come online (checked in the Agenda job), a separate push is sent to the **owner** alerting them that the agent didn't respond. If the agent does come online (detected via `agent_status_change` Socket.IO event), a "✅ Agent is now online" push is sent to the owner.

---

**Q11: How does your domain security for the widget work?**

**Question:** Can someone steal my API key and use my chatbot on their site?

**Ideal Answer:** Yes and no. The first time the widget loads on any domain, we extract the `origin` header, normalize it (remove www, https, trailing slash), and check if it's in `business.allowedDomains`. If not, and if below the plan limit (1 for free, 10 for pro), we automatically add it and save. If the domain limit is reached, we return `403 limitReached: true`. So technically the first load on an unauthorized domain works and auto-allows it — which is intentional for convenience. But once the limit is reached (1 domain on free), additional unauthorized domains are blocked.

---

**Q12: How did you handle the AI confidence scoring?**

**Question:** How do you know when the AI doesn't know the answer?

**Ideal Answer:** We use a prompt engineering technique where the AI is explicitly instructed to prefix every reply with `[CONFIDENCE: High]` or `[CONFIDENCE: Low]`. High means it found the answer in the knowledge base. Low means it's uncertain or doesn't have the information. The backend uses a regex `aiReplyRaw.match(/\[CONFIDENCE:\s*(.*?)\]/i)` to extract this tag, strips it from the visible reply, and uses it to determine whether to escalate. This is simpler and more reliable than trying to parse the AI's prose for uncertainty language, since we control the output format.

---

**Q13: Why did you use MistralAI instead of OpenAI?**

**Ideal Answer:** MistralAI offers a strong price-to-performance ratio. `mistral-large-latest` is competitive with GPT-4 in instruction-following tasks, and `mistral-small-latest` (used for title generation and issue summaries) is very affordable. For a customer support use case where we need consistent, structured outputs — which Mistral handles well — it was a pragmatic choice. The SDK also has a clean interface. The `AI_MODEL` and `AI_PROVIDER` are environment-configurable, so switching providers is possible without code changes.

---

**Q14: How do you handle the maintenance mode?**

**Question:** How do you take the platform down for maintenance without redeploying?

**Ideal Answer:** There's a `maintenanceMode` boolean in the `PlatformConfig` singleton document in MongoDB. The Super Admin can toggle it via the Settings panel. At the start of every `POST /api/chat/message` request, the first database query is `PlatformConfig.findOne()` to check if `maintenanceMode: true`. If it is, we immediately return `503 Service Unavailable`. Business owners don't need to do anything — the moment the Super Admin enables maintenance mode, all chatbots globally stop responding.

---

**Q15: Describe your authentication flow for agents.**

**Question:** When a business owner creates an agent, how does that agent log in?

**Ideal Answer:** The owner calls `POST /api/agents` with `name`, `email`, `password`, and `roleTitle`. The backend creates a `User` document with `role: 'agent'` and `ownerId` pointing to the owner's ID. A welcome email is sent via Resend with the agent's login URL, email, and plaintext temporary password. The agent visits the login page, enters their credentials, and the system returns a JWT. The JWT payload includes `ownerId` so every subsequent request can scope the agent's actions to their owner's business without an extra DB lookup.

---

**Q16: How does your auto-resolve system work?**

**Question:** What happens to conversations that agents abandon?

**Ideal Answer:** `autoResolve.js` runs a `setInterval` every 20 seconds. It queries for conversations with `status: 'in_progress'` that haven't been updated in the last 60 seconds. For each, it checks who sent the last message: if it was an AI, status becomes `ai_resolved`; if it was an agent or owner, it becomes `human_resolved`. The resolution is saved to MongoDB and emitted via Socket.IO to the owner's room. This prevents the inbox from filling with abandoned conversations.

---

**Q17: How do you handle the widget being embedded on mobile?**

**Question:** Is the chat widget responsive on mobile screens?

**Ideal Answer:** Yes. The `widget.template.js` includes a CSS media query at `@media (max-width: 480px)`. On mobile, the chat container changes to `width: 100vw; height: 100vh; bottom: 0; right: 0; border-radius: 0` — effectively full-screen. The open animation changes from `sbBounceIn` to `sbSlideUp` (slides up from the bottom). The chat bubble also hides itself when the window is open on mobile to avoid covering the close button. The tooltip is also hidden on mobile since hover states don't apply.

---

**Q18: What's your approach to data isolation in a multi-tenant system?**

**Question:** How do you ensure one business owner can't see another's conversations?

**Ideal Answer:** Data isolation is enforced at the query level. Every conversation query includes `{ business: business._id }` where the business is always found by `{ owner: req.user._id }` — the currently authenticated user's ID. Agents are further scoped by `{ ownerId: req.user._id }` to only see agents belonging to their owner. The Super Admin has a separate authentication flow entirely and is the only role that can query across all businesses. There's no `WHERE business_id = X` centralized enforcement — it's applied consistently per controller, which is a maintenance concern as the codebase grows.

---

**Q19: How does the PostMessage API work in your widget?**

**Question:** How does the iframe communicate with the parent page?

**Ideal Answer:** The widget creates an iframe pointing to the React ChatWidgetPage. Since the iframe and parent page are on different origins (the parent site vs. the chatbot's domain), direct DOM access is blocked by the Same-Origin Policy. We use `window.postMessage()` for cross-origin communication. The parent page sends `chat-opened` and `chat-closed` messages to `iframe.contentWindow.postMessage('chat-opened', '*')`. The iframe sends back `close-supportbot` when the user clicks the close button, and `{ type: 'unread-count', count: N }` when new messages arrive. The parent listens for these with `window.addEventListener('message', handler)` and shows the unread badge accordingly.

---

**Q20: What would you change if you had more time?**

**Ideal Answer:**
1. **Add TypeScript** — The codebase would benefit from type safety, especially the complex Socket.IO event payloads and Mongoose models
2. **Write tests** — Unit tests for the routing engine, AI confidence parsing, and cache invalidation; integration tests for the auth flow
3. **Integrate a real payment processor** (Stripe) — Plan upgrades are currently manual
4. **Remove unused dependencies** — `nodemailer`, `node-cron`, `googleapis`, `moment-timezone`, and `lucide-react` from the backend package.json
5. **Add Redis** for distributed caching and Socket.IO adapter to support horizontal scaling
6. **Add Helmet.js** for security headers
7. **Implement a repository pattern** to abstract database access from controllers, making it easier to test and swap database implementations

---

# 23. Architecture Diagram Description

## Frontend Flow

```
User Browser
  ↓
Vercel CDN → React App (SPA)
  ↓
React Router → Route matching
  ↓
Protected Route → Check Redux auth state
  ↓
Dashboard Component
  ↓ (parallel)
├── Axios → REST API calls → Render backend
└── Socket.IO Client → WebSocket → Render backend
  ↓
Redux Store (auth + business state)
  ↓
React Components re-render with new data
```

## Backend Flow

```
HTTP Request
  ↓
Express Router
  ↓
Rate Limiter (express-rate-limit)
  ↓
CORS Middleware
  ↓
req.io injection (Socket.IO reference)
  ↓
authMiddleware.protect (JWT verify → req.user)
  ↓
Controller
  ↓ (parallel paths)
├── MongoDB via Mongoose (data persistence)
├── MistralAI SDK (AI responses)
├── Socket.IO emit (real-time events)
├── pushService (Web Push)
├── email (Resend)
└── cache (in-memory)
  ↓
JSON Response
```

## Database Flow

```
MongoDB Atlas
├── User collection
│   └── Indexed: email (unique)
├── Business collection
│   └── Indexed: apiKey (unique), owner
├── Conversation collection
│   └── Embedded: messages[]
│   └── References: business, agent, assignedAgentId
├── Notification collection
│   └── References: senderId, recipientId, businessId
├── PlatformConfig (singleton document)
├── PushSubscription
│   └── References: userId, sessionId
├── PushNotificationLog
│   └── References: userId
└── agendaJobs (Agenda internal)
```

## AI Flow

```
Chat message received
  ↓
Check cache for business config (in-memory Map)
├── Cache hit → use cached config
└── Cache miss → MongoDB query → set cache
  ↓
analyzeMessage() → { emotion, intent }
  ↓
buildSystemPrompt() → inject knowledge, FAQs, context
  ↓
MistralAI API call (mistral-large-latest)
  ↓
Parse [CONFIDENCE:] tag from response
  ↓
needsEscalation?
├── YES → generateIssueSummary (mistral-small-latest)
│        → routeTicket() → assign to agent
│        → pushService.sendNotification (owner + agent)
│        → io.emit('new_ticket')
└── NO  → save messages
          → io.emit('new_message')
```

## Widget Flow

```
Third-Party Website
  ↓
<script src="backend/widget.js" data-api-key="sb_...">
  ↓
widget.js IIFE executes
  ↓
fetch /api/chat/config/:apiKey → branding config
  ↓
Inject CSS + DOM (bubble + container + iframe)
  ↓
iframe src = /chat-widget/:apiKey (React SPA)
  ↓
ChatWidgetPage.jsx loads
  ↓
Socket.IO connects → join_session(conversationId)
  ↓
Customer sends message → POST /api/chat/message
  ↓
AI responds → update local state → socket sync
  ↓
PostMessage API → parent page (unread count, close)
```

---

# 24. Hidden Features Discovery

## 1. AI Name Extraction

The system automatically extracts the visitor's first name from conversational text using regex patterns (`/my name is (.*?)(\.|$|!)/i`, `/I am (.*?)(\.|$|!)/i`, `/call me (.*?)/i`, `/this is (.*?)/i`). Once detected, the name is stored on the conversation and used in all subsequent system prompts. This creates a personalized experience without requiring a formal registration form.

**Why it's valuable:** This is a UX pattern rarely implemented at this level of detail — most chatbots just show "Anonymous" or ask for name upfront in a forced way.

## 2. Auto-Sync Bot Name with Business Name

In `businessController.js`, when an owner updates their business name, the backend detects if the current `botName` was still the default (matching the old business name). If so, it automatically updates `botName` to match the new business name. This prevents the common UX issue of a bot introducing itself with an outdated name.

## 3. Per-Type Push Notification Preferences with Quiet Hours

The notification preference system is genuinely sophisticated: 9 granular preference toggles (`newTickets`, `agentOfflineAlerts`, `conversationResolved`, `teamActivity`, `subscriptionAlerts`, `monthlyReports`, `ticketAssigned`, `newMessages`, `reassignmentAlerts`) plus `enableSounds` and a quiet hours time window with overnight handling (when start > end, wrapping midnight correctly).

## 4. Deduplication in Web Crawler

The scraper's `isDuplicate()` function computes word overlap between new text and all already-scraped pages. If ≥85% of words overlap, the page is skipped. This prevents navigation bars, footers, and boilerplate content (which appears on every page) from dominating the knowledge base.

## 5. Server-Side Widget URL Injection

The `widget.js` endpoint reads `widget.template.js`, replaces `__SERVER_BASE_URL__` with the actual server URL at runtime, and serves it. This means the widget always points to the correct backend without requiring a build step — the template is version-controlled and the URL is dynamically injected per-environment.

## 6. Auto-Allow New Domains (with Plan Limits)

The domain allowlisting for the widget is fully automatic — business owners don't need to manually add domains. The system just records wherever the widget is actually used. This is a UX design decision that prioritizes ease of setup over strict security, but enforces limits via the plan tier.

## 7. Dual-Model AI Strategy

The project uses two different MistralAI models strategically: `mistral-large-latest` for the main customer chat (where quality matters most) and `mistral-small-latest` for auxiliary tasks (title generation, issue summaries, agent suggestions) where speed and cost are the priority. This is a cost-optimization pattern.

## 8. Auto-Deactivation of Dead Push Subscriptions

When `web-push` returns a 410 (Gone) or 404 (Not Found) status code, the push service immediately sets `sub.isActive = false` in MongoDB. This prevents wasted API calls to expired browser subscriptions on future notification sends. Most implementations skip this cleanup step.

---

# 25. SupportBotAI Deep Analysis

## Product Maturity: **Beta / Early Production**

The product is fully functional and deployed, but has several gaps that would need addressing before scaling:
- No payment gateway (manual plan upgrades only)
- No customer-side conversation history persistence (conversations can't be resumed across browser sessions easily)
- No analytics export for individual business owners
- Subscription expiry detection exists in code but plan downgrade is not enforced

## Engineering Maturity: **Mid-Level Production**

Strong real-time architecture, thoughtful systems design, and good security basics — but no tests, some dead code, and single-instance deployment limits scaling.

## Technical Strengths

1. **Real-time system design** — Socket.IO room topology is well-designed for multi-party scenarios
2. **AI integration sophistication** — Confidence tagging, multi-call strategy, agent copilot, name extraction
3. **Background job durability** — Agenda ensures jobs survive restarts
4. **Push notification system** — VAPID, rate limiting, dead subscription cleanup, quiet hours, granular preferences
5. **Atomic operations** — Race condition prevention in ticket routing
6. **Fail-fast configuration** — `validateEnv.js` prevents misconfig deployment
7. **Widget engineering** — PostMessage API, responsive CSS, server-side URL injection

## Business Strengths

1. **Extremely low barrier to entry** — One script tag deployment is a genuine differentiator
2. **AI-to-human handoff** — Solves the "AI alone isn't enough" problem that kills pure chatbots
3. **Multi-tenant SaaS architecture** — Scales to many customers
4. **Super Admin platform control** — Enables rapid platform management without database access

## Unique Differentiators

1. The website auto-scraper (Pro feature) is a genuine technical differentiator that most DIY chatbot tools don't offer
2. The heartbeat-based agent presence system is more robust than most comparable platforms
3. The push notification system working for customers (not just agents) via session-based subscriptions is unusual

## Competitive Advantages

- Full control over AI model selection (not locked to OpenAI)
- Domain allowlisting for widget security
- Built-in in-app notification broadcasting for all roles
- CSV data export for platform-level reporting

---

# 26. Founder Summary

You built a complete, multi-tenant B2B SaaS customer support platform from scratch. Here is what that means:

**What you built:** A production-deployed AI customer support tool that businesses use by pasting a single line of code into their website. Behind that line of code is a sophisticated system: an AI trained on that business's own data, a real-time agent console, browser push notifications, automated ticket routing, background job scheduling, a full super admin control panel, and an embeddable chat widget that works on any website.

**Why it's impressive:** Most developers can build a simple chatbot. Very few can build the supporting infrastructure around it: multi-tenant data isolation, real-time multi-party communication with 7 distinct Socket.IO rooms, atomic race condition prevention for ticket claiming, a heartbeat monitoring system for agent presence, a website crawler that runs in serverless environments, and a Web Push system that works even when the browser is closed.

**Technical challenges solved:**
- Running headless Chrome on a serverless Render environment (solved with `@sparticuz/chromium`)
- Preventing two agents from grabbing the same ticket simultaneously (solved with atomic `findOneAndUpdate` with state guards)
- Synchronizing the chat widget, owner dashboard, and agent console simultaneously (solved with overlapping Socket.IO rooms)
- Making the AI transparently communicate its uncertainty (solved with the confidence tagging prompt engineering pattern)
- Keeping agent status accurate without polling (solved with Socket.IO heartbeats + server-side stale detection)

**Technologies mastered:** MistralAI prompt engineering, Socket.IO real-time architecture, Web Push API (VAPID, service workers), Puppeteer web scraping, MongoDB multi-tenant patterns, JWT + bcrypt authentication, background job scheduling, CDN integration.

**Skills demonstrated:** Systems thinking, distributed systems patterns, AI integration, backend API design, real-time infrastructure, security practices, frontend-backend integration, deployment and DevOps.

---

# 27. Final Developer Profile

Based exclusively on evidence from the codebase:

## Skill Level: **Mid-Senior (3–6 years equivalent)**

---

### Frontend Expertise: **7 / 10**

**Evidence:**
- Feature-sliced design architecture is an above-average organizational choice
- Redux Toolkit usage is correct and idiomatic
- Custom hooks (`usePushNotifications`, `usePlan`) show React maturity
- Framer Motion, Recharts, and Socket.IO client integration are non-trivial
- Vite config with manual chunk splitting shows build optimization knowledge

**Gaps:** No TypeScript. No tests. Some very large component files that need decomposition. Heavy reliance on inline CSS rather than a component library or design tokens.

---

### Backend Expertise: **8 / 10**

**Evidence:**
- Multi-tenant data scoping applied consistently
- Atomic MongoDB operations for race condition prevention
- Heartbeat monitoring system with stale detection
- Rate limiting, fail-fast env validation, graceful error handling
- Utility isolation is clean (pushService, routing, agenda, cache as separate modules)
- Express 5 with correct async error handling

**Gaps:** No input sanitization. No HTTPS/security headers. Large controller files (superAdminController.js at 723 lines). Unused dependencies suggest rapid development without cleanup.

---

### System Design Capability: **7.5 / 10**

**Evidence:**
- Designed a 7-room Socket.IO topology for multi-party real-time sync — this is non-trivial
- Workload-aware routing with holding queue when agents are busy
- Auto-resolve engine, heartbeat system, and background job scheduler show lifecycle thinking
- Dual-model AI strategy (large for quality, small for cost)
- In-memory cache with invalidation on write

**Gaps:** No Redis, no horizontal scaling consideration. No observability or monitoring infrastructure.

---

### DevOps Knowledge: **4 / 10**

**Evidence:**
- Deployed on Vercel + Render (real, working production deployment)
- `vercel.json` configured with API proxy rewrites
- Environment variable management

**Gaps:** No CI/CD pipeline. No Docker configuration. No health check alerting. No log aggregation. Single instance with no failover.

---

### AI Integration Knowledge: **7.5 / 10**

**Evidence:**
- Custom system prompt engineering with dynamic context injection (knowledge base, FAQs, emotion, intent, visitor name)
- Confidence tagging as a machine-readable signal — a non-trivial prompt pattern
- Multi-call strategy (large model for chat, small model for auxiliary tasks)
- Context window management (last 5 messages for issue summary)
- Graceful fallback when AI returns empty responses

**Gaps:** No RAG (Retrieval Augmented Generation) — knowledge base is injected as raw text into every prompt, which will hit token limits for large knowledge bases. No embeddings or vector search.

---

### Real-Time Systems Knowledge: **8 / 10**

**Evidence:**
- Designed a production Socket.IO system with 7 distinct named rooms serving different audiences
- Heartbeat + auto-offline with grace periods
- Typing indicators
- Multi-party message synchronization (widget + dashboard + agent simultaneously)
- Session-based rooms for widget users (no auth required)
- PostMessage API for cross-origin iframe communication

**Gaps:** No Socket.IO Redis adapter (can't scale horizontally). No connection state recovery beyond Socket.IO's built-in reconnection.

---

### Overall Verdict

This codebase demonstrates clear, genuine thinking about distributed systems challenges — race conditions, agent presence, real-time synchronization, AI escalation — that places it solidly at the mid-senior level. The developer understands _why_ patterns like atomic operations, heartbeat monitoring, and workload-aware routing are needed, not just _how_ to use libraries. The primary gaps are automated testing (absent entirely), TypeScript adoption, horizontal scalability, and dependency hygiene. These are fixable and their absence is consistent with a hackathon-origin project that then continued development at pace.

---

*Report generated by full analysis of:*
- *`/backend/server.js` — 173 lines*
- *`/backend/controllers/*.js` — 8 files, ~1,600 lines*
- *`/backend/models/*.js` — 7 files*
- *`/backend/utils/*.js` — 9 files, ~2,000 lines*
- *`/backend/middleware/*.js` — 2 files*
- *`/backend/config/*.js` — 2 files*
- *`/backend/public/widget.template.js` — 281 lines*
- *`/backend/package.json`*
- *`/client/src/app/App.jsx`*
- *`/client/src/app/store/store.js`*
- *`/client/src/features/**` — confirmed 30+ files*
- *`/client/src/shared/**` — hooks, services, components*
- *`/client/package.json`, `/client/vite.config.js`, `/client/vercel.json`*
- *`/README.md`*
