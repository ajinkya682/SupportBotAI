import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config/config.js';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import agentRoutes from './routes/agent.routes.js';
import businessRoutes from './routes/business.routes.js';
import conversationRoutes from './routes/conversation.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import superAdminRoutes from './routes/superAdmin.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please wait a moment and try again.' },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (config.ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS: Origin ${origin} is not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  })
);

app.use('/api/', limiter);
app.use(express.json());

app.get('/widget.js', (req, res) => {
  const templatePath = path.join(__dirname, '../public/widget.template.js');

  try {
    const template = fs.readFileSync(templatePath, 'utf8');
    const filled = template.replace(/__SERVER_BASE_URL__/g, config.SERVER_BASE_URL || '');

    res.setHeader('Content-Type', 'application/javascript');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(filled);
  } catch (error) {
    console.error('widget.js template not found:', error.message);
    res.status(404).send('// widget.js not found');
  }
});

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/business', businessRoutes);
app.use('/api/conversation', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/super-admin', superAdminRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

export default app;