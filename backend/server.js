import config from './src/config/config.js';
import http from 'http';
import { Server } from 'socket.io';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import User from './src/models/user.model.js';
import socketHandler from './src/utils/socket.js';
import autoResolve from './src/utils/autoResolve.js';

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.ALLOWED_ORIGINS,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

socketHandler(io);
autoResolve(io);

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

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.PORT, '0.0.0.0', () => {
      console.log(`Server running on ${config.API_URL}`);
      console.log(`Allowed origins: ${config.ALLOWED_ORIGINS.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();