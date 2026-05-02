import express from 'express';
import authRoutes from './routes/auth.routes.js';
import chatRoutes from './routes/chat.routes.js'
import agentRoutes from './routes/agent.routes.js'
import businessRoutes from './routes/business.routes.js';
import conversationRoutes from './routes/conversation.routes.js'
import notificationRoutes from './routes/notification.routes.js';

const app = express();
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/business',businessRoutes)
app.use('/api/conversation',conversationRoutes)
app.use('/api/notifications', notificationRoutes);

export default app;