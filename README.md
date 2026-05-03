# SupportBotAI — Complete Rebuild & Collaboration Guide
### Four developers. One platform. 24 hours. Zero confusion.

---

## TABLE OF CONTENTS

1. Platform Overview
2. Tech Stack & Architecture
3. Complete File & Folder Structure
4. Library Reference
5. Environment Variables
6. Team Split for 4 Members
7. 24-Hour Build Timeline
8. Git Collaboration Rules
9. Backend Implementation
10. Frontend Implementation
11. Database Schema & Setup
12. API Endpoints Reference
13. Feature-by-Feature Guide
14. Visual Recreation Guide
15. Testing Checklist
16. Deployment Guide
17. Common Errors & Fixes

---

## SECTION 1 — PLATFORM OVERVIEW

SupportBotAI is a premium B2B SaaS platform that lets business owners create their own AI-powered customer support chat bot in minutes. Imagine you own a pizza shop and customers keep calling to ask about your hours or menu. With SupportBotAI, you paste your FAQ and business info into the platform, and it gives you a small piece of code. You paste that code onto your website and instantly you have a smart chat box that answers customer questions automatically, without you doing anything.

### Who Uses It

Business owners who are too busy to answer the same customer questions every day but cannot afford to hire a full-time support team.

### The Problem It Solves

Small and medium businesses lose customers because no one is available to answer questions at 2am. SupportBotAI gives every business a 24/7 AI support agent trained on their own information.

### The 5 Most Important Features

1. AI Training — The ability to paste raw text, FAQs, and business info to teach the AI about your specific business.
2. The Embeddable Widget — A chat box that lives on the customer's own website but talks to our server, loaded with a single script tag.
3. The Dashboard — Where businesses see every conversation their AI is having in real time.
4. Appearance Customization — Changing the chat box colors, bot name, and welcome message to match their own brand.
5. Analytics — Seeing how many customers were helped without a human, success rates, and response times.

### The Full User Flow

Step 1. User opens SupportBotAI and clicks Sign Up.
Step 2. User completes the 3-step registration: account creation, then business profile, then initial AI training.
Step 3. User is taken to the Dashboard.
Step 4. User goes to the Training section and pastes their FAQ or knowledge base.
Step 5. User goes to the Appearance section and picks a theme color and bot name.
Step 6. User goes to the Integration section and copies the script tag.
Step 7. User pastes the script tag into their own website HTML.
Step 8. Their customers now see a chat widget and talk to the AI.
Step 9. The business owner checks the Dashboard to read every conversation and see analytics.

### External Services Connected

- MistralAI or OpenAI — The AI brain that reads the business knowledge and generates answers to customer questions.
- MongoDB Atlas — The cloud database where all users, businesses, conversations, and settings are stored.
- Google Fonts — Loads the Inter font for the premium UI design.

---

## SECTION 2 — TECH STACK & ARCHITECTURE

### Frontend Technologies

| Technology | Version | What It Does | Why Used Here |
|---|---|---|---|
| React | 19.2.5 | UI component framework | The entire frontend is built with React components |
| Redux Toolkit | 2.11.2 | Global state management | Shares user and business data across all pages without prop drilling |
| Framer Motion | 12.38.0 | Animation library | Creates smooth transitions for the premium feel |
| Lucide React | Latest | Icon library | Provides clean consistent icons throughout the dashboard |
| Recharts | Latest | Chart library | Powers the Analytics page graphs and visualizations |
| Axios | Latest | HTTP client | Makes all API calls from frontend to backend |
| Vite | 8.0.10 | Build tool and dev server | Extremely fast hot reloading during development |

### Backend Technologies

| Technology | Version | What It Does | Why Used Here |
|---|---|---|---|
| Express | 5.2.1 | Web server framework | Handles all API routing and HTTP requests |
| JSON Web Token | 9.0.3 | Authentication tokens | Keeps users logged in securely without server sessions |
| BcryptJS | 3.0.3 | Password hashing | Hashes passwords so they are never stored in plain text |
| MistralAI | 2.2.1 | AI text generation | Alternative to OpenAI for generating customer support answers |
| Dotenv | Latest | Environment config | Loads secret keys from the .env file into the app |
| Cors | Latest | Cross-origin requests | Allows the frontend and widget to talk to the backend |

### Database Technologies

| Technology | Version | What It Does | Why Used Here |
|---|---|---|---|
| Mongoose | 9.6.0 | MongoDB object modeling | Creates structured schemas for all data stored in MongoDB |
| MongoDB Atlas | N/A | Cloud database | Stores all users, businesses, conversations, and settings |

### System Architecture Diagram

```
[Customer Browser]
      |
      | Loads widget via <script> tag
      v
[widget.js served from server/public]
      |
      | Creates iframe pointing to ChatWidgetPage
      v
[ChatWidgetPage.jsx running in iframe]
      |
      | POST /api/chat/message
      v
[Express Backend on Port 5005]
      |
      |--- authMiddleware checks JWT
      |--- chatController processes message
      |--- Queries MongoDB for business knowledge
      |--- Sends prompt to MistralAI or OpenAI
      |--- Saves conversation to MongoDB
      |
      v
[MongoDB Atlas] <--- [All other API routes for Dashboard]
                                    ^
                                    |
                         [React Dashboard on Port 5173]
                         [Business owner logged in with JWT]
```

---

## SECTION 3 — COMPLETE FILE & FOLDER STRUCTURE

```
Customer-Support-main/
|
|--- index.html                         Root demo page used to test the widget embed on a fake site
|--- .gitignore                         Tells Git to ignore node_modules, .env, and build folders
|
|--- server/                            Everything that runs on the backend server
|    |--- server.js                     Entry point that starts Express and connects to the database
|    |--- package.json                  Lists all backend dependencies and npm run scripts
|    |--- .env                          Holds all secret keys (never commit this file)
|    |--- .gitignore                    Backend specific gitignore rules
|    |
|    |--- config/
|    |    |--- db.js                    Handles the MongoDB Atlas connection logic
|    |    |--- cache.js                 Simple in-memory cache to speed up repeated AI responses
|    |
|    |--- models/
|    |    |--- User.js                  Mongoose schema defining how user accounts are stored
|    |    |--- Business.js              Mongoose schema for business settings, API key, and AI training text
|    |    |--- Conversation.js          Mongoose schema storing every message between customer and AI
|    |
|    |--- routes/
|    |    |--- authRoutes.js            Maps auth HTTP endpoints to their controller functions
|    |    |--- businessRoutes.js        Maps business settings endpoints to their controller functions
|    |    |--- chatRoutes.js            Maps public chat endpoints used by the widget
|    |    |--- conversationRoutes.js    Maps conversation history endpoints for the dashboard inbox
|    |
|    |--- controllers/
|    |    |--- authController.js        Runs the actual login and registration logic
|    |    |--- businessController.js    Saves and retrieves business settings and branding
|    |    |--- chatController.js        The core AI engine that processes customer messages
|    |    |--- conversationController.js Fetches and deletes chat logs for the dashboard
|    |
|    |--- middleware/
|    |    |--- authMiddleware.js        Checks if the JWT token is valid before allowing dashboard access
|    |
|    |--- public/
|    |    |--- widget.js               The script that businesses paste on their site to load the chat bot
|    |
|    |--- scripts/
|         |--- seed_pro.js             Creates a test Pro plan user in the database for development
|
|--- client/                            Everything that runs in the browser
     |--- package.json                  Lists all frontend dependencies and npm run scripts
     |--- vite.config.js                Vite build configuration and dev server proxy settings
     |--- index.html                    The HTML shell that React injects itself into
     |--- eslint.config.js              Code quality rules for the frontend
     |
     |--- src/
          |--- main.jsx                 React entry point that mounts the app and wraps it in Redux store
          |--- App.jsx                  Root component that sets up all page routes
          |--- store.js                 Creates the central Redux store connecting all slices
          |--- index.css                Global CSS reset and font imports
          |--- App.css                  The entire premium design system with CSS variables and component styles
          |
          |--- slices/
          |    |--- authSlice.js        Redux slice managing the logged in user state
          |    |--- businessSlice.js    Redux slice managing all business settings and branding data
          |    |--- conversationSlice.js Redux slice managing the list of conversations in the inbox
          |
          |--- pages/
          |    |--- Home.jsx            The main landing page with hero, features, and CTA sections
          |    |--- Login.jsx           The login page with email and password form
          |    |--- Signup.jsx          The 3-step registration flow
          |    |--- Dashboard.jsx       The wrapper page for all logged-in dashboard views
          |    |--- ChatWidgetPage.jsx  The actual chat UI that loads inside the widget iframe
          |    |--- Product.jsx         Detailed product features marketing page
          |    |--- Pricing.jsx         Pricing tiers and plan comparison page
          |    |--- Docs.jsx            Setup instructions and user guide page
          |    |--- AdminPanel.jsx      Admin only view for managing all users
          |
          |--- components/
               |--- Navbar.jsx          Top navigation bar shown on all public pages
               |
               |--- dashboard/
                    |--- Sidebar.jsx    Left side navigation menu inside the dashboard
                    |--- Overview.jsx   Dashboard home showing key stats and recent activity
                    |--- Training.jsx   Text area where businesses paste their AI knowledge base
                    |--- Appearance.jsx Color picker and bot name editor with live preview
                    |--- Integration.jsx Shows the API key and the embed script tag to copy
                    |--- Conversations.jsx Inbox showing every customer conversation in full
                    |--- Analytics.jsx  Charts showing conversation volume and success rates
```

---

## SECTION 4 — LIBRARY REFERENCE

### Backend Dependencies

| Package | Version | What It Does | Why This Project Needs It | Where Used |
|---|---|---|---|---|
| express | 5.2.1 | Web server framework for Node.js | Creates the entire API server and handles all route definitions | server.js, all route files |
| mongoose | 9.6.0 | Object data modeling for MongoDB | Defines schemas and queries the database with JavaScript objects | All model files, all controllers |
| jsonwebtoken | 9.0.3 | Creates and verifies JWT tokens | Keeps users logged in securely across requests | authController.js, authMiddleware.js |
| bcryptjs | 3.0.3 | Hashes and compares passwords | Stores passwords safely so plain text is never saved | authController.js |
| @mistralai/mistralai | 2.2.1 | MistralAI API client | Sends prompts to the AI and receives generated answers | chatController.js |
| dotenv | Latest | Loads .env file into process.env | Makes secret keys available throughout the app securely | server.js top line |
| cors | Latest | Enables cross-origin HTTP requests | Allows the React frontend on port 5173 to call the API on port 5005 | server.js |

### Frontend Dependencies

| Package | Version | What It Does | Why This Project Needs It | Where Used |
|---|---|---|---|---|
| react | 19.2.5 | UI component library | The entire frontend is built as React components | Every JSX file |
| react-dom | 19.2.5 | Renders React into the browser | Mounts the App component into index.html | main.jsx |
| react-router-dom | Latest | Client-side page routing | Navigates between Home, Login, Dashboard without page reload | App.jsx |
| @reduxjs/toolkit | 2.11.2 | State management for React | Shares auth and business data across all pages globally | store.js, all slices |
| react-redux | Latest | Connects Redux to React components | Lets components read from and write to the Redux store | Every page and component |
| framer-motion | 12.38.0 | Animation library | Adds smooth entrance animations for the premium look | Home.jsx, Dashboard views |
| lucide-react | Latest | SVG icon library | Provides all icons used in sidebar, buttons, and cards | All dashboard components |
| recharts | Latest | Charting library for React | Renders the line and bar charts on the Analytics page | Analytics.jsx |
| axios | Latest | HTTP client for API calls | Makes all requests from frontend to the Express backend | All slice files |

---

## SECTION 5 — ENVIRONMENT VARIABLES

Create a file called .env inside the server folder. Copy this exactly and fill in your real values.

```
# The port your backend server runs on
# How to get it: Just use 5005 or any port not in use on your machine
# Required: Yes
PORT=5005

# Your MongoDB connection string
# How to get it: Go to MongoDB Atlas, create a cluster, click Connect, choose Driver, copy the string
# Example: mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/supportbotai
# Required: Yes
MONGODB_URI=your_mongodb_connection_string_here

# A long random secret string used to sign JWT tokens
# How to get it: Run this in your terminal: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Example: a9f3b2c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0
# Required: Yes
JWT_SECRET=your_long_random_secret_key_here

# Your OpenAI or MistralAI API key for generating AI responses
# How to get it: Go to platform.openai.com or console.mistral.ai, create an account, generate an API key
# Example: sk-proj-abc123xyz789...
# Required: Yes
OPENAI_API_KEY=your_ai_api_key_here

# The environment the app is running in
# Use development locally and production when deployed
# Required: No, defaults to development
NODE_ENV=development
```

---

## SECTION 6 — TEAM SPLIT FOR 4 MEMBERS

### Team Member 1 — Backend Lead

Files owned:
- server/server.js
- server/config/db.js
- server/config/cache.js
- server/routes/authRoutes.js
- server/routes/businessRoutes.js
- server/routes/chatRoutes.js
- server/routes/conversationRoutes.js
- server/controllers/authController.js
- server/controllers/businessController.js
- server/controllers/conversationController.js
- server/middleware/authMiddleware.js
- server/package.json

Hour by hour tasks:
- Hour 0 to 2: Initialize the Node project, install all backend packages, create server.js and connect to MongoDB
- Hour 2 to 4: Build User and Business Mongoose models, set up .env file
- Hour 4 to 6: Build authRoutes.js and authController.js with register and login endpoints
- Hour 6 to 8: Build authMiddleware.js and test that protected routes reject bad tokens
- Hour 8 to 10: Build businessRoutes.js and businessController.js for getting and updating settings
- Hour 10 to 12: Build conversationRoutes.js and conversationController.js for the inbox
- Hour 12 to 18: Fix bugs, help Team Member 3 with chatController integration, review Team Member 2 pull requests
- Hour 18 to 24: Final backend testing, fix CORS issues, prepare for deployment

Skills required: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt

---

### Team Member 2 — Frontend Lead

Files owned:
- client/src/main.jsx
- client/src/App.jsx
- client/src/store.js
- client/src/slices/authSlice.js
- client/src/slices/businessSlice.js
- client/src/slices/conversationSlice.js
- client/src/pages/Login.jsx
- client/src/pages/Signup.jsx
- client/src/pages/Dashboard.jsx
- client/src/pages/AdminPanel.jsx
- client/package.json
- client/vite.config.js

Hour by hour tasks:
- Hour 0 to 2: Create Vite React project, install all frontend packages, set up file structure
- Hour 2 to 4: Build store.js and connect all three Redux slices
- Hour 4 to 6: Build authSlice.js with register, login, and logout async actions using Axios
- Hour 6 to 8: Build Login.jsx and Signup.jsx pages connected to authSlice
- Hour 8 to 10: Build Dashboard.jsx wrapper with routing between dashboard sections
- Hour 10 to 12: Build businessSlice.js and conversationSlice.js with all API connections
- Hour 12 to 16: Connect all dashboard components to Redux state, test data flowing correctly
- Hour 16 to 20: Fix state bugs, handle loading and error states in the UI
- Hour 20 to 24: Final testing of the full auth flow, push fixes, review Team Member 3 pull requests

Skills required: React, Redux Toolkit, Axios, React Router, JavaScript

---

### Team Member 3 — Database and Integrations Lead

Files owned:
- server/models/User.js
- server/models/Business.js
- server/models/Conversation.js
- server/controllers/chatController.js
- server/public/widget.js
- server/scripts/seed_pro.js
- client/src/pages/ChatWidgetPage.jsx

Hour by hour tasks:
- Hour 0 to 2: Design all three Mongoose schemas on paper before writing code, confirm field names with the whole team
- Hour 2 to 4: Write User.js, Business.js, and Conversation.js schemas
- Hour 4 to 6: Write seed_pro.js script to create test data and confirm schemas work
- Hour 6 to 10: Build chatController.js with MistralAI or OpenAI integration and business knowledge retrieval
- Hour 10 to 14: Build widget.js the public loader script that creates the iframe and injects it into customer sites
- Hour 14 to 18: Build ChatWidgetPage.jsx the actual chat UI that lives inside the iframe
- Hour 18 to 22: Test the full widget flow from script tag to AI response, fix any postMessage communication bugs
- Hour 22 to 24: Security testing, verify API keys are validated correctly, help with deployment

Skills required: MongoDB, Mongoose, OpenAI or MistralAI API, JavaScript, iframe communication

---

### Team Member 4 — UI and Quality Lead

Files owned:
- client/src/App.css
- client/src/index.css
- client/src/components/Navbar.jsx
- client/src/components/dashboard/Sidebar.jsx
- client/src/components/dashboard/Overview.jsx
- client/src/components/dashboard/Training.jsx
- client/src/components/dashboard/Appearance.jsx
- client/src/components/dashboard/Integration.jsx
- client/src/components/dashboard/Conversations.jsx
- client/src/components/dashboard/Analytics.jsx
- client/src/pages/Home.jsx
- client/src/pages/Product.jsx
- client/src/pages/Pricing.jsx
- client/src/pages/Docs.jsx

Hour by hour tasks:
- Hour 0 to 2: Set up App.css with all CSS variables for colors, spacing, and typography. Build the design system foundation.
- Hour 2 to 6: Build Navbar.jsx with responsive mobile menu and authentication state awareness
- Hour 6 to 10: Build the full Home.jsx landing page with hero section, features grid, and CTA
- Hour 10 to 14: Build all dashboard components: Sidebar, Overview, Training, Appearance, Integration
- Hour 14 to 17: Build Conversations.jsx inbox and Analytics.jsx with Recharts graphs
- Hour 17 to 20: Build Product.jsx, Pricing.jsx, and Docs.jsx marketing pages
- Hour 20 to 22: Full manual QA pass on every page, every button, every form, every responsive breakpoint
- Hour 22 to 24: Fix visual bugs, polish animations, verify mobile layout on 375px screen width

Skills required: CSS, React, Framer Motion, Recharts, responsive design

---

## SECTION 7 — 24-HOUR BUILD TIMELINE

```
HOUR  | TM1 Backend Lead          | TM2 Frontend Lead         | TM3 DB and Integrations   | TM4 UI and Quality
------|---------------------------|---------------------------|---------------------------|---------------------------
0-1   | Setup Node project        | Setup Vite React project  | Design all DB schemas     | Setup App.css design system
1-2   | Install backend packages  | Install frontend packages | Confirm field names team  | Define all CSS variables
2-3   | Create server.js          | Create store.js           | Write User.js model       | Start Navbar.jsx
3-4   | Connect MongoDB db.js     | Create authSlice.js       | Write Business.js model   | Finish Navbar.jsx
4-5   | Write User.js model ref   | Create businessSlice.js   | Write Conversation.js     | Start Home.jsx hero
5-6   | Build authRoutes.js       | Create conversationSlice  | Run seed_pro.js script    | Build Home.jsx features
      |                           |                           |                           |
      | CHECKPOINT 1 - Hour 6: Backend auth running, database connected, frontend routing working
      |
6-7   | Build authController reg  | Build Login.jsx           | Start chatController.js   | Build Home.jsx CTA
7-8   | Build authController log  | Build Signup.jsx step 1   | MistralAI integration     | Finish Home.jsx page
8-9   | Build authMiddleware.js   | Build Signup.jsx step 2   | Build AI prompt logic     | Start Dashboard Sidebar
9-10  | Test all auth endpoints   | Build Signup.jsx step 3   | Build knowledge retrieval | Build Dashboard Overview
      |                           |                           |                           |
      | CHECKPOINT 2 - Hour 10: Full auth flow works end to end, user can sign up and see dashboard
      |
10-11 | Build businessRoutes.js   | Build Dashboard.jsx wrap  | Start widget.js loader    | Build Training.jsx
11-12 | Build businessController  | Connect businessSlice UI  | Build iframe creation     | Build Appearance.jsx
12-13 | Build conversationRoutes  | Build conversationSlice   | Build widget positioning  | Build Integration.jsx
13-14 | Build conversationCtrl    | Connect conversations UI  | Build postMessage comms   | Build Conversations.jsx
      |                           |                           |                           |
      | CHECKPOINT 3 - Hour 14: Widget loads on test page, AI responds to messages, dashboard shows conversations
      |
14-15 | Fix backend bugs          | Fix Redux state bugs      | Build ChatWidgetPage.jsx  | Build Analytics.jsx
15-16 | Review TM2 pull requests  | Fix loading states        | Build chat UI in iframe   | Add Recharts graphs
16-17 | Help TM3 with chat API    | Fix error handling        | Test full widget flow      | Build Product.jsx
17-18 | CORS configuration        | Review TM4 pull requests  | Fix postMessage bugs      | Build Pricing.jsx
18-19 | Security review           | Final auth flow test      | API key validation test   | Build Docs.jsx
19-20 | Prepare deployment config | Final dashboard test      | Widget security test      | Full manual QA pass
20-21 | Deploy backend to Render  | Build environment config  | Seed production database  | Mobile responsive fixes
21-22 | Verify production APIs    | Deploy frontend to Vercel | Monitor production logs   | Fix visual bugs
22-23 | Fix production bugs       | Fix production bugs       | Final integration test    | Final polish pass
23-24 | Final verification        | Final verification        | Final verification        | Final verification
      |                           |                           |                           |
      | CHECKPOINT 4 - Hour 24: Everything deployed, widget works on live site, all features verified
```

---

## SECTION 8 — GIT COLLABORATION RULES

Every team member must read this entire section before writing a single line of code.

### One-Time Setup on Day One

Every team member runs these exact commands once on their own computer.

Step 1. Clone the repository to your computer:
```
git clone https://github.com/your-team/supportbotai.git
```

Step 2. Go into the project folder:
```
cd supportbotai
```

Step 3. Set your name and email so your commits show who wrote them:
```
git config user.name "Your Full Name"
git config user.email "your@email.com"
```

Step 4. Verify your setup worked:
```
git config --list
```
You should see your name and email in the output.

Step 5. Create the develop branch if it does not exist:
```
git checkout -b develop
git push origin develop
```

---

### Branch Rules

The main branch always contains working production code. Nobody ever commits directly to main. Ever. Not once. Not even for a small fix.

The develop branch is the shared working branch where finished features get merged. Nobody commits directly to develop either.

Every team member creates their own feature branch and works only on that branch.

Every branch name must follow this exact format: your role, then a forward slash, then a short description using only lowercase letters and hyphens with no spaces.

Correct examples:
- backend/user-auth
- backend/chat-controller
- frontend/login-page
- frontend/dashboard-routing
- database/user-schema
- database/widget-script
- ui/navbar-component
- ui/home-landing-page

Wrong examples that will be rejected:
- myBranch
- fix stuff
- frontend_login
- TM2-work
- test

If a branch name does not follow the correct format it will not be accepted as a pull request.

---

### Daily Git Routine

The very first thing every morning before touching any code, every single team member must do this:

```
git checkout develop
git pull origin develop
git checkout your-branch-name
git merge develop
```

Skipping this step is the number one cause of merge conflicts and is not allowed. If you skip this and cause a conflict that breaks another team member's work, you are responsible for fixing it immediately.

---

### Commit Rules

Commit your work every two hours minimum. Do not wait until the end of the day. Small frequent commits are much easier to fix than one giant commit.

One commit must contain only one feature or one fix. Never mix two unrelated changes in one commit.

Every commit message must follow this exact format:
```
type: short description of what changed
```

The types you can use:
- feat — for a new feature or functionality
- fix — for fixing a bug
- style — for any CSS or visual change
- refactor — for rewriting code without changing what it does
- db — for any database schema or migration change
- docs — for documentation changes
- chore — for config, setup, or dependency changes

Good commit message examples:
```
feat: add user login endpoint
feat: build Signup step 2 form
fix: correct password hash comparison
fix: resolve CORS error on chat route
style: update button hover color to primary
style: fix mobile navbar menu overflow
refactor: simplify conversation fetch logic
db: add users table schema
db: add apiKey field to Business model
chore: update vite config proxy settings
docs: add environment variable instructions
```

Bad commit messages that are not allowed:
```
update stuff
fix things
changes
wip
asdfasdf
done
```

Commit messages must always be in present tense. Write "add login endpoint" not "added login endpoint."

---

### Push Rules

Before every push you must first pull the latest code from develop and merge it into your branch. This makes sure you have all the latest code from your teammates and prevents conflicts on the server.

Do these steps in this exact order every single time you push:

```
git add .
git commit -m "feat: your commit message here"
git checkout develop
git pull origin develop
git checkout your-branch-name
git merge develop
```

If there are no conflicts after the merge:
```
git push origin your-branch-name
```

If there are conflicts, fix them first following the Merge Conflict Rules section below, then push.

---

### Pull Request Rules

When you finish a complete feature open a pull request from your feature branch into develop on GitHub.

The pull request title must match your branch name exactly.

The pull request description must answer these three questions:
1. What does this change do?
2. How can a teammate test it?
3. Are there any known issues or things still missing?

Every pull request must be reviewed and approved by at least one other team member before it gets merged. Nobody merges their own pull request.

The review pairs are:
- Team Member 1 reviews Team Member 2 pull requests
- Team Member 2 reviews Team Member 1 pull requests
- Team Member 3 reviews Team Member 4 pull requests
- Team Member 4 reviews Team Member 3 pull requests

If you are reviewing a pull request you must actually test the code. Run it locally, click through the feature, confirm it works, then approve it.

---

### Merge Conflict Rules

A merge conflict happens when two team members edited the exact same line in the same file at the same time and Git does not know which version to keep.

When you open a file with a conflict it will look like this:

```
<<<<<<< HEAD
This is your code that you wrote
=======
This is your teammate's code that they wrote
>>>>>>> develop
```

Here are the exact steps to fix it:

Step 1. Open the file that has the conflict in your code editor.

Step 2. Find the lines starting with less than less than less than HEAD. Everything between that line and the equals signs is your code. Everything between the equals signs and greater than greater than greater than is your teammate's code.

Step 3. Decide which version is correct. Sometimes you keep yours. Sometimes you keep theirs. Sometimes you combine both. Talk to your teammate if you are not sure.

Step 4. Delete the three marker lines completely. Delete the line with less than less than less than HEAD. Delete the line with the equals signs. Delete the line with greater than greater than greater than. Keep only the actual code you want.

Step 5. Save the file.

Step 6. Run this command to mark the conflict as resolved:
```
git add filename.js
```

Step 7. Finish the merge:
```
git commit
```

If you are unsure how to resolve a conflict you must stop immediately and message the team member whose code is in the conflict. Never guess. Never delete someone else's code without asking them first.

---

### Protected Files

These files must never be edited by more than one person at the same time:
- server/package.json
- client/package.json
- client/vite.config.js
- client/tailwind.config.js (if it exists)
- server/.env.example
- client/src/App.css

If you need to change a protected file you must:
1. Announce it in the team chat right now before touching anything
2. Make your change
3. Commit and push it immediately
4. Tell everyone in the chat to pull immediately before continuing their work

Nobody continues working until they have pulled the protected file change.

---

### Emergency Rules — When Something Breaks

If you push code that breaks the develop branch you must tell the whole team in the chat immediately. Do not try to fix it quietly. Do not push more code trying to fix it without telling anyone. Stop. Tell the team. Fix it together.

To undo the last push run these exact commands:
```
git revert HEAD
git push origin develop
```

Never use git push force on the develop or main branch under any circumstances. Using force push on develop or main can permanently delete your teammates' work and there is no way to get it back.

---

### Quick Reference Card

Save this. Look at it every time before you do anything with Git.

Morning start — do this before touching any code:
```
git checkout develop
git pull origin develop
git checkout your-branch-name
git merge develop
```

Save your work — do this every 2 hours:
```
git add .
git commit -m "type: description"
```

Push your work — do this after committing:
```
git checkout develop
git pull origin develop
git checkout your-branch-name
git merge develop
git push origin your-branch-name
```

Check what files you changed:
```
git status
```

Check the commit history:
```
git log --oneline
```

Create a new branch:
```
git checkout -b backend/your-feature-name
```

See all branches:
```
git branch -a
```

---

## SECTION 9 — BACKEND IMPLEMENTATION

Create every file in this exact order. Do not skip ahead.

---

### File 1: server/package.json

Create this first. Without this file you cannot install any packages.

```json
{
  "name": "supportbotai-server",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "mongoose": "^9.6.0",
    "jsonwebtoken": "^9.0.3",
    "bcryptjs": "^3.0.3",
    "@mistralai/mistralai": "^2.2.1",
    "dotenv": "^16.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

After creating this file run:
```
npm install
```

You should see a node_modules folder appear. If you see errors check your internet connection and try again.

---

### File 2: server/.env

Create this second. Your server cannot start without these values.

```
PORT=5005
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_here
OPENAI_API_KEY=your_ai_api_key_here
NODE_ENV=development
```

Never commit this file to Git. It is already in .gitignore.

---

### File 3: server/config/db.js

Create the config folder first. Then create this file.

```javascript
// Load the mongoose library for connecting to MongoDB
const mongoose = require('mongoose');

// Define an async function that connects to the database
const connectDB = async () => {
  try {
    // Attempt to connect using the URI from the .env file
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    // Log a success message showing which server we connected to
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // If connection fails, print the error message
    console.error(`Database connection error: ${error.message}`);
    // Exit the entire Node process with a failure code
    process.exit(1);
  }
};

// Export the function so server.js can call it
module.exports = connectDB;
```

---

### File 4: server/server.js

This is the entry point. All other files connect to this one.

```javascript
// Load environment variables from .env file into process.env
require('dotenv').config();

// Import the Express web framework
const express = require('express');

// Import the CORS library to allow cross-origin requests from the frontend
const cors = require('cors');

// Import our database connection function
const connectDB = require('./config/db');

// Create the Express application instance
const app = express();

// Connect to the MongoDB database
connectDB();

// Enable CORS so the frontend on port 5173 can call this server on port 5005
app.use(cors());

// Tell Express to automatically parse JSON request bodies
app.use(express.json());

// Serve all files in the public folder as static files (this is how widget.js is served)
app.use(express.static('public'));

// Register the authentication routes at /api/auth
app.use('/api/auth', require('./routes/authRoutes'));

// Register the business settings routes at /api/business
app.use('/api/business', require('./routes/businessRoutes'));

// Register the public chat routes at /api/chat (used by the widget)
app.use('/api/chat', require('./routes/chatRoutes'));

// Register the conversation history routes at /api/conversations
app.use('/api/conversations', require('./routes/conversationRoutes'));

// Read the port from .env or default to 5005
const PORT = process.env.PORT || 5005;

// Start the server and listen for incoming requests
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

After creating this file run:
```
node server.js
```

You should see:
```
MongoDB Connected: cluster0.abc123.mongodb.net
Server running on port 5005
```

If you see "Address already in use" it means something else is using port 5005. Run this to kill it:
```
killall node
```
Then start the server again.

---

### File 5: server/models/User.js

```javascript
// Import mongoose to define the schema
const mongoose = require('mongoose');

// Define the shape of a User document in MongoDB
const userSchema = new mongoose.Schema({
  // The user's full name, required field
  name: {
    type: String,
    required: true
  },
  // The user's email address, must be unique across all users
  email: {
    type: String,
    required: true,
    unique: true
  },
  // The hashed password, never store plain text passwords
  password: {
    type: String,
    required: true
  },
  // The user's role, either regular user or admin
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
// Add automatic createdAt and updatedAt timestamps to every document
}, { timestamps: true });

// Export the model so controllers can use it to query the database
module.exports = mongoose.model('User', userSchema);
```

---

### File 6: server/models/Business.js

```javascript
// Import mongoose for schema definition
const mongoose = require('mongoose');

// Import crypto to generate random API keys
const crypto = require('crypto');

// Define the shape of a Business document in MongoDB
const businessSchema = new mongoose.Schema({
  // Link this business to its owner user by their MongoDB ID
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // The business name entered during signup
  name: {
    type: String,
    required: true
  },
  // The unique API key used by the widget to identify this business
  apiKey: {
    type: String,
    unique: true,
    // Automatically generate a random 32-character hex key when a business is created
    default: () => crypto.randomBytes(32).toString('hex')
  },
  // The raw text pasted by the business owner to train their AI
  knowledge: {
    type: String,
    default: ''
  },
  // Visual customization settings for the chat widget
  appearance: {
    // The primary color of the widget in hex format
    themeColor: { type: String, default: '#6366f1' },
    // The name displayed as the bot in the chat
    botName: { type: String, default: 'AI Assistant' },
    // The first message the bot shows when the widget opens
    welcomeMessage: { type: String, default: 'Hi! How can I help you today?' },
    // The placeholder text in the chat input field
    placeholderText: { type: String, default: 'Type your message...' },
    // Optional URL for a company logo image
    companyLogo: { type: String, default: '' }
  },
  // The subscription plan of this business
  plan: {
    type: String,
    enum: ['free', 'pro'],
    default: 'free'
  }
}, { timestamps: true });

// Export the model for use in controllers
module.exports = mongoose.model('Business', businessSchema);
```

---

### File 7: server/models/Conversation.js

```javascript
// Import mongoose for schema definition
const mongoose = require('mongoose');

// Define the shape of a Conversation document
const conversationSchema = new mongoose.Schema({
  // Link this conversation to the business it belongs to
  business: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Business',
    required: true
  },
  // A unique ID for the website visitor, generated on the frontend
  externalId: {
    type: String,
    required: true
  },
  // An array of messages in this conversation
  messages: [{
    // Who sent the message, either the user or the AI assistant
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    // The actual text content of the message
    content: {
      type: String,
      required: true
    },
    // When this specific message was sent
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  // Whether this conversation is still ongoing or finished
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  }
}, { timestamps: true });

// Export the model for use in controllers
module.exports = mongoose.model('Conversation', conversationSchema);
```

---

### File 8: server/middleware/authMiddleware.js

```javascript
// Import JWT library for verifying tokens
const jwt = require('jsonwebtoken');

// Import the User model to find the user after verifying the token
const User = require('../models/User');

// Define the middleware function, it runs before any protected route handler
const protect = async (req, res, next) => {
  let token;

  // Check if the request has an Authorization header starting with Bearer
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract just the token part after the word Bearer
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key from .env
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database using the ID stored in the token
      // .select('-password') means fetch everything except the password field
      req.user = await User.findById(decoded.id).select('-password');

      // Call next() to pass control to the actual route handler
      next();
    } catch (error) {
      // If verification fails the token is invalid or expired
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If there is no token at all, reject the request
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Export the middleware for use in route files
module.exports = { protect };
```

---

### File 9: server/controllers/authController.js

```javascript
// Import JWT for creating tokens after login
const jwt = require('jsonwebtoken');

// Import bcrypt for hashing passwords
const bcrypt = require('bcryptjs');

// Import the User model
const User = require('../models/User');

// Import the Business model to create a linked business on signup
const Business = require('../models/Business');

// Helper function to create a signed JWT token for a given user ID
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Handle the POST /api/auth/register request
const registerUser = async (req, res) => {
  try {
    // Destructure the fields sent in the request body
    const { name, email, password, businessName } = req.body;

    // Check if a user with this email already exists in the database
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password with a salt of 10 rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user document in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Create the linked business document at the same time
    const business = await Business.create({
      owner: user._id,
      name: businessName || `${name}'s Business`
    });

    // Send back the user data and a JWT token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle the POST /api/auth/login request
const loginUser = async (req, res) => {
  try {
    // Get the email and password from the request body
    const { email, password } = req.body;

    // Find the user by their email address
    const user = await User.findOne({ email });

    // If user exists, compare the submitted password with the stored hash
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle the GET /api/auth/me request to get the current logged-in user
const getMe = async (req, res) => {
  // req.user is set by authMiddleware before this function runs
  res.json(req.user);
};

// Export all controller functions
module.exports = { registerUser, loginUser, getMe };
```

---

### File 10: server/routes/authRoutes.js

```javascript
// Import Express Router
const express = require('express');
const router = express.Router();

// Import the controller functions
const { registerUser, loginUser, getMe } = require('../controllers/authController');

// Import the protect middleware for the protected route
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register — public, no auth needed
router.post('/register', registerUser);

// POST /api/auth/login — public, no auth needed
router.post('/login', loginUser);

// GET /api/auth/me — protected, must have valid JWT
router.get('/me', protect, getMe);

// Export the router
module.exports = router;
```

---

### File 11: server/controllers/businessController.js

```javascript
// Import the Business model
const Business = require('../models/Business');

// Import the Conversation model for stats calculation
const Conversation = require('../models/Conversation');

// Handle GET /api/business — fetch the current user's business details
const getBusiness = async (req, res) => {
  try {
    // Find the business where the owner field matches the logged-in user
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    res.json(business);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle PUT /api/business — update business settings
const updateBusiness = async (req, res) => {
  try {
    // Find the business belonging to the logged-in user
    const business = await Business.findOne({ owner: req.user._id });

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    // Update only the fields that were sent in the request body
    if (req.body.name) business.name = req.body.name;
    if (req.body.knowledge !== undefined) business.knowledge = req.body.knowledge;
    if (req.body.appearance) {
      // Merge new appearance settings with existing ones
      business.appearance = { ...business.appearance, ...req.body.appearance };
    }

    // Save the updated business back to the database
    const updatedBusiness = await business.save();
    res.json(updatedBusiness);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Handle GET /api/business/stats — aggregate analytics for the dashboard
const getStats = async (req, res) => {
  try {
    // Find the business first to get its ID
    const business = await Business.findOne({ owner: req.user._id });

    // Count total conversations for this business
    const totalConversations = await Conversation.countDocuments({ business: business._id });

    // Count conversations from the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentConversations = await Conversation.countDocuments({
      business: business._id,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      totalConversations,
      recentConversations,
      successRate: 94
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all controller functions
module.exports = { getBusiness, updateBusiness, getStats };
```

---

### File 12: server/routes/businessRoutes.js

```javascript
// Import Express Router
const express = require('express');
const router = express.Router();

// Import controller functions
const { getBusiness, updateBusiness, getStats } = require('../controllers/businessController');

// Import protect middleware — all business routes require login
const { protect } = require('../middleware/authMiddleware');

// GET /api/business — get business details
router.get('/', protect, getBusiness);

// PUT /api/business — update business settings
router.put('/', protect, updateBusiness);

// GET /api/business/stats — get analytics stats
router.get('/stats', protect, getStats);

// Export the router
module.exports = router;
```

---

## SECTION 10 — FRONTEND IMPLEMENTATION

Create every file in this exact order.

---

### File 1: client/package.json

```json
{
  "name": "supportbotai-client",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.5",
    "react-dom": "^19.2.5",
    "react-router-dom": "^6.0.0",
    "@reduxjs/toolkit": "^2.11.2",
    "react-redux": "^9.0.0",
    "framer-motion": "^12.38.0",
    "lucide-react": "^0.400.0",
    "recharts": "^2.0.0",
    "axios": "^1.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^8.0.10"
  }
}
```

After creating this run:
```
npm install
```

---

### File 2: client/vite.config.js

```javascript
// Import the Vite configuration helper
import { defineConfig } from 'vite';

// Import the official React plugin for Vite
import react from '@vitejs/plugin-react';

// Export the Vite configuration
export default defineConfig({
  // Register the React plugin to enable JSX and fast refresh
  plugins: [react()],
  server: {
    // Proxy API requests from the frontend to the backend during development
    proxy: {
      // Any request starting with /api will be forwarded to the backend
      '/api': 'http://localhost:5005'
    }
  }
});
```

---

### File 3: client/src/store.js

```javascript
// Import configureStore from Redux Toolkit
import { configureStore } from '@reduxjs/toolkit';

// Import all the slice reducers
import authReducer from './slices/authSlice';
import businessReducer from './slices/businessSlice';
import conversationReducer from './slices/conversationSlice';

// Create the central Redux store
const store = configureStore({
  reducer: {
    // The auth key holds the logged-in user state
    auth: authReducer,
    // The business key holds all business settings and branding
    business: businessReducer,
    // The conversations key holds the inbox data
    conversations: conversationReducer
  }
});

// Export the store so main.jsx can provide it to the whole app
export default store;
```

---

### File 4: client/src/main.jsx

```javascript
// Import React for JSX support
import React from 'react';

// Import ReactDOM to render the app into the HTML
import ReactDOM from 'react-dom/client';

// Import the Provider component to give all components access to Redux
import { Provider } from 'react-redux';

// Import our Redux store
import store from './store';

// Import the root App component
import App from './App';

// Import global styles
import './index.css';

// Find the div with id="root" in index.html and mount the app inside it
ReactDOM.createRoot(document.getElementById('root')).render(
  // StrictMode helps catch bugs during development
  <React.StrictMode>
    // Provider wraps everything so every component can access the store
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
```

---

### File 5: client/src/App.jsx

```javascript
// Import React Router components for page navigation
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import useSelector to read from Redux store
import { useSelector } from 'react-redux';

// Import all page components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Product from './pages/Product';
import Pricing from './pages/Pricing';
import Docs from './pages/Docs';
import ChatWidgetPage from './pages/ChatWidgetPage';

// Import global styles
import './App.css';

// Component that protects routes from unauthenticated users
const ProtectedRoute = ({ children }) => {
  // Read the current user from Redux auth state
  const { user } = useSelector((state) => state.auth);
  // If not logged in redirect to login page, otherwise show the page
  return user ? children : <Navigate to="/login" />;
};

// Main App component that defines all routes
function App() {
  return (
    <Router>
      <Routes>
        // Public routes anyone can visit
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/product" element={<Product />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/docs" element={<Docs />} />
        // Special route for the widget iframe
        <Route path="/widget-chat" element={<ChatWidgetPage />} />
        // Protected route that requires login
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}

// Export App so main.jsx can render it
export default App;
```

---

## SECTION 11 — DATABASE SCHEMA & SETUP

### Table 1: Users

Purpose: Stores every registered account on the platform.

| Field | Type | Rules | Description |
|---|---|---|---|
| _id | ObjectId | Auto generated | Unique MongoDB identifier |
| name | String | Required | User's full name |
| email | String | Required, Unique | Login email address |
| password | String | Required | Bcrypt hashed password |
| role | String | Default: user | Either user or admin |
| createdAt | Date | Auto | When account was created |
| updatedAt | Date | Auto | When account was last modified |

### Table 2: Businesses

Purpose: Stores every business profile including API keys and AI training data.

| Field | Type | Rules | Description |
|---|---|---|---|
| _id | ObjectId | Auto generated | Unique MongoDB identifier |
| owner | ObjectId | Required, ref: User | Links to the owner's User document |
| name | String | Required | The business name |
| apiKey | String | Unique, Auto | Random 32-character hex key |
| knowledge | String | Default empty | The raw text used to train the AI |
| appearance.themeColor | String | Default: #6366f1 | Primary color of the widget |
| appearance.botName | String | Default: AI Assistant | The name shown in the chat |
| appearance.welcomeMessage | String | Default set | First message the bot sends |
| plan | String | Default: free | Either free or pro |

### Table 3: Conversations

Purpose: Stores every chat session between a website visitor and the AI.

| Field | Type | Rules | Description |
|---|---|---|---|
| _id | ObjectId | Auto generated | Unique MongoDB identifier |
| business | ObjectId | Required, ref: Business | Links to the business this chat belongs to |
| externalId | String | Required | Unique visitor ID from the widget |
| messages | Array | — | Array of message objects |
| messages.role | String | user or assistant | Who sent this message |
| messages.content | String | Required | The actual message text |
| messages.timestamp | Date | Auto | When this message was sent |
| status | String | Default: active | Either active or closed |

### Database Setup Commands

Run these in this exact order:

```
# Step 1: Go to MongoDB Atlas, create a free cluster, click Connect, copy the connection string

# Step 2: Paste the connection string into server/.env as MONGODB_URI

# Step 3: Start your server which will auto-create the collections
node server.js

# Step 4: Create a test Pro user with seeded data
node server/scripts/seed_pro.js

# Step 5: Verify by checking Atlas dashboard or connecting with MongoDB Compass
```

---

## SECTION 12 — API ENDPOINTS REFERENCE

### Authentication Endpoints

POST /api/auth/register — Create a new account

Request body:
```
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "businessName": "Smith's Bakery"
}
```

Success response 201:
```
{
  "_id": "64abc123...",
  "name": "John Smith",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGc..."
}
```

Error 400: User already exists
Error 500: Server error

---

POST /api/auth/login — Log into an existing account

Request body:
```
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Success response 200:
```
{
  "_id": "64abc123...",
  "name": "John Smith",
  "email": "john@example.com",
  "role": "user",
  "token": "eyJhbGc..."
}
```

Error 401: Invalid email or password

---

GET /api/auth/me — Get current logged-in user

Header required: Authorization: Bearer eyJhbGc...

Success response 200:
```
{
  "_id": "64abc123...",
  "name": "John Smith",
  "email": "john@example.com",
  "role": "user"
}
```

Error 401: Not authorized, no token

---

### Business Endpoints (All require Authorization header)

GET /api/business — Get business settings

Success response 200:
```
{
  "_id": "64def456...",
  "owner": "64abc123...",
  "name": "Smith's Bakery",
  "apiKey": "a1b2c3d4e5f6...",
  "knowledge": "We are a bakery open 7am to 6pm...",
  "appearance": {
    "themeColor": "#6366f1",
    "botName": "Bakery Bot",
    "welcomeMessage": "Welcome to Smith's Bakery!"
  },
  "plan": "free"
}
```

---

PUT /api/business — Update business settings

Request body (send only the fields you want to change):
```
{
  "knowledge": "Updated FAQ text here",
  "appearance": {
    "themeColor": "#2563eb",
    "botName": "New Bot Name"
  }
}
```

Success response 200: Returns the full updated business object

---

GET /api/business/stats — Get analytics data

Success response 200:
```
{
  "totalConversations": 142,
  "recentConversations": 23,
  "successRate": 94
}
```

---

### Chat Endpoints (Public, no auth required)

GET /api/chat/config/:apiKey — Widget fetches branding on load

Success response 200:
```
{
  "appearance": {
    "themeColor": "#6366f1",
    "botName": "AI Assistant",
    "welcomeMessage": "Hi! How can I help?"
  },
  "businessName": "Smith's Bakery"
}
```

Error 404: Business not found

---

POST /api/chat/message — Widget sends customer message to AI

Request body:
```
{
  "apiKey": "a1b2c3d4e5f6...",
  "message": "What are your opening hours?",
  "conversationId": "64ghi789..."
}
```

Success response 200:
```
{
  "reply": "We are open Monday to Saturday from 7am to 6pm and closed on Sundays.",
  "conversationId": "64ghi789..."
}
```

---

## SECTION 13 — FEATURE BY FEATURE GUIDE

### Feature 1: User Registration

What it does: Creates a new user account and a linked business profile in one step.

Files involved:
- Backend: authController.js registerUser function, authRoutes.js, User.js model, Business.js model
- Frontend: Signup.jsx, authSlice.js registerUser async action, App.jsx routing

Full flow step by step:
1. User fills out the 3-step Signup form and clicks the final submit button
2. Signup.jsx calls the registerUser action from authSlice.js
3. authSlice.js sends POST /api/auth/register with name, email, password, businessName
4. The request hits authRoutes.js which calls registerUser in authController.js
5. authController.js checks if the email already exists using User.findOne
6. If it does not exist, it hashes the password with bcrypt
7. It creates the User document in MongoDB
8. It creates the Business document in MongoDB linked to the new user
9. It generates a JWT token using the user's ID
10. It sends back the user object and the token
11. authSlice.js receives the response and saves the user and token to Redux state
12. authSlice.js also saves the user to localStorage so they stay logged in on refresh
13. App.jsx detects the user in Redux state and redirects to /dashboard

---

### Feature 2: The Embeddable Widget

What it does: Lets businesses put a chat bot on their own website using one script tag.

Files involved:
- Backend: widget.js in public folder, chatController.js, chatRoutes.js
- Frontend: ChatWidgetPage.jsx

Full flow step by step:
1. Business owner copies the script tag from the Integration page and pastes it on their website
2. The customer visits the business website and the script tag loads widget.js from our server
3. widget.js reads the data-api-key attribute from the script tag
4. widget.js creates an iframe element pointing to our /widget-chat route with the apiKey in the URL
5. The iframe loads ChatWidgetPage.jsx from our React app
6. ChatWidgetPage.jsx reads the apiKey from the URL query string
7. ChatWidgetPage.jsx calls GET /api/chat/config/:apiKey to fetch the business branding
8. The chat UI renders with the business colors and bot name
9. Customer types a message and clicks send
10. ChatWidgetPage.jsx sends POST /api/chat/message with the message and apiKey
11. chatController.js finds the business by apiKey, reads their knowledge base
12. It sends the customer message plus the business knowledge as context to MistralAI
13. MistralAI generates a response based only on the provided knowledge
14. The response is saved to MongoDB as a Conversation document
15. The response is sent back to ChatWidgetPage.jsx and displayed in the chat

---

### Feature 3: AI Training

What it does: Lets businesses paste their own information to teach the AI what to say.

Files involved:
- Backend: businessController.js updateBusiness, businessRoutes.js, Business.js model
- Frontend: Training.jsx dashboard component, businessSlice.js updateBusiness action

Full flow:
1. Business owner opens the Dashboard and clicks Training in the sidebar
2. Training.jsx fetches the current knowledge from Redux businessSlice state
3. Owner edits the text in the textarea and clicks Save
4. Training.jsx dispatches the updateBusiness action from businessSlice.js
5. businessSlice.js sends PUT /api/business with the new knowledge text
6. businessController.js finds the business and updates the knowledge field
7. The saved knowledge is now used as context in every future chatController.js call
8. When a customer asks a question the AI reads this knowledge to generate the answer

---

## SECTION 14 — VISUAL RECREATION GUIDE

### Colors

Primary brand color: #6366f1
Primary dark: #4f46e5
Success green: #10b981
Warning amber: #f59e0b
Error red: #ef4444
Background dark: #0f0f1a
Background card: rgba(255, 255, 255, 0.05)
Text primary: #ffffff
Text secondary: #94a3b8
Border color: rgba(255, 255, 255, 0.1)

### CSS Variables (paste into App.css)

```css
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --primary-light: #818cf8;
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --bg-primary: #0f0f1a;
  --bg-secondary: #1a1a2e;
  --bg-card: rgba(255, 255, 255, 0.05);
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border: rgba(255, 255, 255, 0.1);
  --border-hover: rgba(255, 255, 255, 0.2);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
}
```

### Typography

Font: Inter from Google Fonts

Load it in index.html:
```
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

Apply it globally in index.css:
```css
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background-color: #0f0f1a;
  color: #ffffff;
}
```

### Button Component Specifications

Primary button:
- Background: #6366f1
- Color: #ffffff
- Border: none
- Border radius: 8px
- Font size: 14px
- Font weight: 600
- Padding: 12px 24px
- Hover background: #4f46e5
- Hover transform: translateY(-1px)
- Active transform: translateY(0)
- Transition: all 0.2s ease

### Card Component Specifications

- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border radius: 16px
- Padding: 24px
- Backdrop filter: blur(10px)
- Hover border: rgba(255, 255, 255, 0.2)

### Input Component Specifications

- Background: rgba(255, 255, 255, 0.05)
- Border: 1px solid rgba(255, 255, 255, 0.1)
- Border radius: 8px
- Color: #ffffff
- Font size: 14px
- Padding: 12px 16px
- Focus border: #6366f1
- Placeholder color: #64748b

---

## SECTION 15 — TESTING CHECKLIST

Manual QA checklist — test every item before calling the build done:

Authentication:
- User can register with a new email and see the dashboard
- User cannot register with an email that already exists and sees an error message
- User can log in with correct credentials
- User sees an error when logging in with wrong password
- User stays logged in after refreshing the browser
- User can log out and is redirected to the home page
- Visiting /dashboard without being logged in redirects to /login

Dashboard:
- Dashboard loads and shows the Overview section by default
- Sidebar navigation switches between all sections
- Business name appears correctly in the sidebar
- Overview shows conversation count and stats

Training:
- Training textarea shows the current saved knowledge
- User can edit the text and click Save
- After saving the new text persists after page refresh
- The AI uses the new knowledge in widget responses

Appearance:
- Color picker changes the preview in real time
- Bot name change shows in the preview
- Welcome message change shows in the preview
- Clicking Save persists all changes

Integration:
- API key is displayed and can be copied
- Script tag is displayed and can be copied
- Copied script tag loads the widget when pasted into a test HTML file

Widget:
- Widget appears on the test page as a chat button
- Clicking the button opens the chat window
- Bot name and color match the dashboard settings
- Customer can type and send a message
- AI responds with an answer based on the knowledge base
- Conversation appears in the Dashboard Conversations inbox

Responsive design:
- All pages look correct on 375px mobile width
- All pages look correct on 768px tablet width
- All pages look correct on 1440px desktop width

---

## SECTION 16 — DEPLOYMENT GUIDE

### Backend Deployment on Render

Step 1. Create a free account at render.com

Step 2. Click New and select Web Service

Step 3. Connect your GitHub repository

Step 4. Configure the service:
- Root directory: server
- Build command: npm install
- Start command: node server.js

Step 5. Add all environment variables in the Render dashboard:
- PORT: 10000 (Render sets this automatically)
- MONGODB_URI: your Atlas connection string
- JWT_SECRET: your long random secret
- OPENAI_API_KEY: your AI API key
- NODE_ENV: production

Step 6. Click Deploy. Your backend URL will be something like https://supportbotai-api.onrender.com

### Frontend Deployment on Vercel

Step 1. Create a free account at vercel.com

Step 2. Click New Project and import your GitHub repository

Step 3. Configure the project:
- Root directory: client
- Build command: npm run build
- Output directory: dist

Step 4. Add environment variables:
- VITE_API_URL: https://supportbotai-api.onrender.com

Step 5. Click Deploy. Your frontend URL will be something like https://supportbotai.vercel.app

Step 6. Update the CORS settings in your backend to allow your Vercel domain:
```javascript
app.use(cors({
  origin: ['https://supportbotai.vercel.app', 'http://localhost:5173'],
  credentials: true
}));
```

---

## SECTION 17 — COMMON ERRORS AND FIXES

### Error: MongoDB connection failed

When it happens: When you start the server for the first time
Why it happens: MONGODB_URI in .env is wrong or your IP is not whitelisted in Atlas
Fix:
1. Go to MongoDB Atlas, click Network Access, click Add IP Address, click Allow Access From Anywhere
2. Check your connection string format: mongodb+srv://username:password@cluster0.abc123.mongodb.net/supportbotai
3. Make sure there are no spaces or extra characters in your MONGODB_URI

---

### Error: Cannot read properties of undefined reading user

When it happens: In the dashboard after page refresh
Why it happens: Redux state is empty after refresh because it is stored in memory
Fix: Add this to authSlice.js to load from localStorage on startup:
```javascript
const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const initialState = { user };
```

---

### Error: CORS error in browser console

When it happens: When the frontend tries to call the backend
Why it happens: CORS is not configured to allow your frontend URL
Fix in server.js:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
```

---

### Error: JWT malformed or invalid signature

When it happens: When accessing protected routes
Why it happens: The JWT_SECRET in .env is different from the one used to create the token
Fix: Make sure JWT_SECRET has not changed. If you changed it all existing tokens are invalid and users need to log in again.

---

### Error: Widget not loading on test site

When it happens: When pasting the script tag into index.html
Why it happens: The script src URL points to the wrong server address
Fix: Make sure the widget script tag src points to your running backend URL:
```
<script src="http://localhost:5005/widget.js" data-api-key="your-api-key"></script>
```

---

### Error: AI not responding or returning empty message

When it happens: When a customer sends a message in the widget
Why it happens: OPENAI_API_KEY or MISTRAL_API_KEY is invalid or missing
Fix:
1. Check your API key in .env has no extra spaces
2. Check your account has available credits on the AI platform
3. Check the server console for the specific AI API error message

---

*Document compiled from full codebase analysis of SupportBotAI*
*Platform: Customer support AI SaaS*
*Stack: React, Express, MongoDB, MistralAI*
*Team size: 4 developers*
*Rebuild target: 24 hours*
