require('dotenv').config();
require('./config/validateEnv')();

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);

// ── Build allowed origins from environment ──────────────────────────────────
const buildAllowedOrigins = () => {
  const origins = [process.env.FRONTEND_URL].filter(Boolean);
  if (process.env.ADDITIONAL_ORIGINS) {
    const extra = process.env.ADDITIONAL_ORIGINS.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    origins.push(...extra);
  }
  return origins;
};

const allowedOrigins = buildAllowedOrigins();

// ── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: '*', // Open for widget to work everywhere
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  },
});

// Pass io to req before routes
app.use((req, res, next) => {
  req.io = io;
  // Fix for Google Login COOP issues
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

// ── CORS — open for widget compatibility ──────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      // Always allow — widget can be embedded on any site
      // Domain-level security is handled inside chatController.getWidgetConfig
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  })
);

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100;
const WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000;

const limiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please wait a moment and try again.' },
});
app.use('/api/', limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Widget.js — served dynamically with injected SERVER_BASE_URL ──────────────
app.get('/widget.js', (req, res) => {
  const templatePath = path.join(__dirname, 'public', 'widget.template.js');
  try {
    let template = fs.readFileSync(templatePath, 'utf8');
    const filled = template.replace(/__SERVER_BASE_URL__/g, process.env.SERVER_BASE_URL || '');
    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(filled);
  } catch (err) {
    console.error('widget.js template not found:', err.message);
    res.status(404).send('// widget.js not found');
  }
});

app.use(express.static('public'));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/business', require('./routes/businessRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));
app.use('/api/conversations', require('./routes/conversationRoutes'));
app.use('/api/agents', require('./routes/agentRoutes'));
app.use('/api/super-admin', require('./routes/superAdminRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// ── Catch-all for undefined API routes ────────────────────────────────────────
app.use('/api', (req, res) => {
  console.warn(`[404] API Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `API route ${req.originalUrl} not found` });
});

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

require('./utils/socket')(io);
require('./utils/autoResolve')(io);

// ── Agent Heartbeat Monitor ────────────────────────────────────────────────────
const HEARTBEAT_INTERVAL_MS = 30000;
const AGENT_OFFLINE_AFTER_MS = 60000;

setInterval(async () => {
  try {
    const threshold = new Date(Date.now() - AGENT_OFFLINE_AFTER_MS);
    const agentsToOffline = await User.find({
      role: 'agent',
      status: { $ne: 'offline' },
      lastHeartbeat: { $lt: threshold },
    });

    for (const agent of agentsToOffline) {
      agent.status = 'offline';
      await agent.save();
      io.to(agent.ownerId.toString()).emit('agent_status_changed', {
        agentId: agent._id,
        status: 'offline',
      });
    }
  } catch (error) {
    console.error('Heartbeat check error:', error);
  }
}, HEARTBEAT_INTERVAL_MS);

// ── Start Server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB Connected');

    // Initialize Agenda
    const agenda = require('./utils/agenda');
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 API Base URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();