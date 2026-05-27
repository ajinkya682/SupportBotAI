<div align="center">

# 🤖 SupportBotAI

### _AI-Powered Customer Support, Built for Every Business_

<br/>

[![🏆 Sheryians Cohort Hackathon](https://img.shields.io/badge/🏆%20Sheryians%20Cohort%20Hackathon-Creative%20Excellence%20Winner-gold?style=for-the-badge)](https://sheryians.com)
[![48-Hour Build](https://img.shields.io/badge/⏱%20Built%20In-48%20Hours-blueviolet?style=for-the-badge)](#)
[![Team Size](https://img.shields.io/badge/👥%20Team-4%20Developers-blue?style=for-the-badge)](#)

<br/>

[![React](https://img.shields.io/badge/React-19.2.5-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=flat-square&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/atlas)
[![Redux](https://img.shields.io/badge/Redux%20Toolkit-2.11.2-764ABC?style=flat-square&logo=redux)](https://redux-toolkit.js.org)
[![MistralAI](https://img.shields.io/badge/MistralAI-Powered-FF7000?style=flat-square)](https://mistral.ai)

<br/>

> **SupportBotAI** lets any business owner create a smart AI support chatbot in minutes — trained on their own data, embedded with one line of code, available 24/7.

<br/>

[🚀 Live Demo](#) · [📖 Docs](#docs) · [🐛 Report Bug](../../issues) · [💡 Request Feature](../../issues)

---

</div>

## 🏆 Hackathon Achievement

> **Winner — Creative Excellence Category**
> **Sheryians Coding School Cohort Hackathon · 48 Hours**

We built SupportBotAI from scratch in 48 hours as a team of 4, delivering a full-stack B2B SaaS platform with a live embeddable AI widget, real-time dashboard, and AI powered by MistralAI. The project was recognised for its premium design quality, complete feature set, and production-ready architecture.

---

## 📋 Table of Contents

- [What Is SupportBotAI](#-what-is-supportbotai)
- [Features](#-features)
- [Demo](#-demo)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Team](#-team)
- [License](#-license)

---

## 💡 What Is SupportBotAI

Small and medium businesses lose customers every night because no one is there to answer a simple question at 2am.

**SupportBotAI** solves this with three steps:

1. **Train** — Paste your FAQ, business hours, menu, or any text into the dashboard
2. **Customise** — Pick your brand colours, bot name, and welcome message
3. **Embed** — Copy one `<script>` tag and paste it on your website

Your customers get instant, accurate answers 24/7. You get full visibility into every conversation from your dashboard.

---

## ✨ Features

| Feature                  | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| 🧠 **AI Training**       | Paste raw text, FAQs, or a knowledge base to train the bot on your business  |
| 💬 **Embeddable Widget** | One script tag drops a fully branded chat box onto any website               |
| 📊 **Live Dashboard**    | See every customer conversation in real time from a clean inbox              |
| 🎨 **Appearance Editor** | Customise theme colour, bot name, and welcome message with live preview      |
| 📈 **Analytics**         | Track conversation volume, success rates, and response patterns              |
| 🔐 **Secure Auth**       | JWT-based authentication with bcrypt password hashing                        |
| ⚡ **Response Cache**    | In-memory caching layer to speed up repeated AI queries                      |
| 🔑 **API Key System**    | Each business gets a unique auto-generated API key for widget identification |

---

## 🎬 Demo

### Full User Journey

```
Sign Up → Business Profile → Paste Knowledge → Customise Widget → Copy Script Tag → Paste on Site → Watch It Work
```

### Widget in Action

```html
<!-- This one line is all your customers need -->
<script
  src="https://your-domain.com/widget.js"
  data-api-key="YOUR_API_KEY"
></script>
```

Drop this tag into any HTML page and a smart branded chat assistant appears instantly.

---

## 🏗 Architecture

```
┌─────────────────────┐
│   Customer Browser  │
│  (any website)      │
└────────┬────────────┘
         │ loads <script> tag
         ▼
┌─────────────────────┐
│     widget.js       │  ← served from Express /public
│  (creates iframe)   │
└────────┬────────────┘
         │ iframe src → /widget-chat?apiKey=...
         ▼
┌─────────────────────┐
│  ChatWidgetPage.jsx │  ← React component in iframe
│  (chat UI)          │
└────────┬────────────┘
         │ POST /api/chat/message
         ▼
┌─────────────────────────────────────────────┐
│           Express Backend · Port 5005        │
│                                              │
│  authMiddleware → chatController             │
│       ↓                  ↓                  │
│  JWT check       Query business knowledge   │
│                          ↓                  │
│                   MistralAI API             │
│                          ↓                  │
│                  Save to MongoDB            │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────┐        ┌──────────────────────┐
│    MongoDB Atlas    │ ←───── │  React Dashboard     │
│  Users, Businesses, │        │  Port 5173           │
│  Conversations      │        │  (business owner)    │
└─────────────────────┘        └──────────────────────┘
```

---

## 🛠 Tech Stack

### Frontend

| Technology    | Version | Purpose                   |
| ------------- | ------- | ------------------------- |
| React         | 19.2.5  | UI component framework    |
| Redux Toolkit | 2.11.2  | Global state management   |
| Framer Motion | 12.38.0 | Smooth animations         |
| Recharts      | Latest  | Analytics graphs          |
| Lucide React  | Latest  | Icon library              |
| Axios         | Latest  | HTTP client               |
| Vite          | 8.0.10  | Build tool and dev server |

### Backend

| Technology     | Version | Purpose                       |
| -------------- | ------- | ----------------------------- |
| Express        | 5.2.1   | Web server and API routing    |
| Mongoose       | 9.6.0   | MongoDB object modelling      |
| JSON Web Token | 9.0.3   | Authentication tokens         |
| BcryptJS       | 3.0.3   | Password hashing              |
| MistralAI      | 2.2.1   | AI text generation            |
| Dotenv         | Latest  | Environment configuration     |
| CORS           | Latest  | Cross-origin request handling |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- A [MongoDB Atlas](https://mongodb.com/atlas) account (free tier works)
- A [MistralAI](https://console.mistral.ai) or [OpenAI](https://platform.openai.com) API key

### Clone the Repository

```bash
git clone https://github.com/your-team/supportbotai.git
cd supportbotai
```

### Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Configure Environment Variables

Create a `.env` file inside the `server/` folder:

```env
PORT=5005
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_long_random_secret_key
OPENAI_API_KEY=your_mistral_or_openai_api_key
NODE_ENV=development
```

See [Environment Variables](#-environment-variables) for full details.

### Run the Application

```bash
# Terminal 1 — Start the backend
cd server
npm run dev

# Terminal 2 — Start the frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Seed Test Data

```bash
# Creates a Pro plan test user in your database
node server/scripts/seed_pro.js
```

---

## 🔑 Environment Variables

Create `server/.env` with the following:

| Variable         | Required | Description                     | How to Get It                                                                                          |
| ---------------- | -------- | ------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `PORT`           | Yes      | Backend server port             | Use `5005`                                                                                             |
| `MONGODB_URI`    | Yes      | MongoDB Atlas connection string | Atlas → Connect → Drivers                                                                              |
| `JWT_SECRET`     | Yes      | Secret for signing JWT tokens   | Run `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`                         |
| `OPENAI_API_KEY` | Yes      | MistralAI or OpenAI API key     | [console.mistral.ai](https://console.mistral.ai) or [platform.openai.com](https://platform.openai.com) |
| `NODE_ENV`       | No       | App environment                 | `development` or `production`                                                                          |

> ⚠️ **Never commit `.env` to Git.** It is already listed in `.gitignore`.

---

## 📡 API Reference

### Authentication

| Method | Endpoint             | Auth         | Description                      |
| ------ | -------------------- | ------------ | -------------------------------- |
| `POST` | `/api/auth/register` | None         | Create account + linked business |
| `POST` | `/api/auth/login`    | None         | Log in, receive JWT              |
| `GET`  | `/api/auth/me`       | Bearer token | Get current user                 |

### Business

| Method | Endpoint              | Auth         | Description                        |
| ------ | --------------------- | ------------ | ---------------------------------- |
| `GET`  | `/api/business`       | Bearer token | Fetch business settings            |
| `PUT`  | `/api/business`       | Bearer token | Update knowledge, appearance, name |
| `GET`  | `/api/business/stats` | Bearer token | Get analytics stats                |

### Chat (Public — used by the widget)

| Method | Endpoint                   | Auth | Description                    |
| ------ | -------------------------- | ---- | ------------------------------ |
| `GET`  | `/api/chat/config/:apiKey` | None | Fetch branding for widget      |
| `POST` | `/api/chat/message`        | None | Send message, receive AI reply |

### Example: Send a Chat Message

```bash
curl -X POST http://localhost:5005/api/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_business_api_key",
    "message": "What are your opening hours?",
    "conversationId": "optional_existing_id"
  }'
```

Response:

```json
{
  "reply": "We are open Monday to Saturday 7am to 6pm, closed Sundays.",
  "conversationId": "64ghi789..."
}
```

---

## 📁 Project Structure

```
supportbotai/
├── server/                     # Express backend
│   ├── server.js               # Entry point
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cache.js            # In-memory response cache
│   ├── models/
│   │   ├── User.js             # User schema
│   │   ├── Business.js         # Business + API key schema
│   │   └── Conversation.js     # Chat history schema
│   ├── controllers/
│   │   ├── authController.js   # Register, login, getMe
│   │   ├── businessController.js
│   │   ├── chatController.js   # Core AI engine
│   │   └── conversationController.js
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT verification
│   ├── routes/                 # Route definitions
│   └── public/
│       └── widget.js           # Embeddable widget loader
│
└── client/                     # React frontend
    └── src/
        ├── slices/             # Redux state slices
        ├── pages/              # Route-level pages
        └── components/
            └── dashboard/      # All dashboard views
```

---

## 👥 Team

Built in 48 hours by a team of 4 at the Sheryians Cohort Hackathon.

| Role                       | Responsibilities                                                 |
| -------------------------- | ---------------------------------------------------------------- |
| **Backend Lead**           | Express server, auth, business and conversation APIs, deployment |
| **Frontend Lead**          | React app, Redux store, auth flow, dashboard routing             |
| **DB & Integrations Lead** | Mongoose schemas, MistralAI integration, widget script, chat UI  |
| **UI & Quality Lead**      | Design system, all page components, responsive QA, animations    |

---

## 🚢 Deployment

### Backend → [Render](https://render.com)

- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`
- Set all environment variables in the Render dashboard

### Frontend → [Vercel](https://vercel.com)

- Root directory: `client`
- Build command: `npm run build`
- Output directory: `dist`
- Add `VITE_API_URL=https://your-render-url.onrender.com`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Built with ❤️ in 48 hours · Sheryians Cohort Hackathon · 🏆 Creative Excellence Winner**

<br/>

_If this project helped you, please consider giving it a ⭐_

</div>
