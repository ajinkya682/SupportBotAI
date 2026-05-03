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
    origin: "*",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
  allowEIO3: true,
  transports: ['polling', 'websocket']
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
    
    
    const result = await User.updateMany(
      {
        role: 'agent',
        status: { $ne: 'offline' },
        lastHeartbeat: { $lt: threshold },
      },
      { status: 'offline' }
    );

    if (result.modifiedCount > 0) {
      
      const offlineAgents = await User.find({
        role: 'agent',
        status: 'offline',
        lastHeartbeat: { $lt: threshold },
      }).select('_id ownerId').lean();

      const ownerIds = new Set(offlineAgents.map(a => a.ownerId?.toString()).filter(Boolean));
      
      ownerIds.forEach(ownerId => {
        io.to(ownerId).emit('agents_offline_status', {
          count: result.modifiedCount,
          timestamp: new Date()
        });
      });

      console.log(`✅ Batch offline update: ${result.modifiedCount} agents set to offline`);
    }
  } catch (error) {
    console.error('❌ Heartbeat check error:', error);
  }
}, HEARTBEAT_INTERVAL_MS);

const startServer = async () => {
  try {
    await connectDB();
    server.listen(config.PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on ${config.API_URL}`);
      console.log(`📋 Allowed origins: ${config.ALLOWED_ORIGINS.join(', ')}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};


const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ ${signal} received. Shutting down gracefully...`);
  
  
  server.close(() => {
    console.log('✅ Server closed, no longer accepting connections');
  });

  
  io.disconnectSockets();

 
  const shutdownTimeout = setTimeout(() => {
    console.error('❌ Forced shutdown after timeout');
    process.exit(1);
  }, 30000);

  try {
   
    if (global.cache) {
      global.cache.shutdown?.();
      console.log('✅ Cache cleaned up');
    }

    clearTimeout(shutdownTimeout);
    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};


process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));


process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();