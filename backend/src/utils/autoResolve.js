import Conversation from '../models/conversation.model.js';

const INACTIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000; // 24 hours

export default (io) => {
    setInterval(async () => {
        try {
            const threshold = new Date(Date.now() - INACTIVE_THRESHOLD_MS);
            
            const inactiveConversations = await Conversation.find({
                status: { $in: ['open', 'human_needed', 'in_progress'] },
                updatedAt: { $lt: threshold }
            });

            for (const conv of inactiveConversations) {
                conv.status = conv.isAiActive ? 'ai_resolved' : 'human_resolved';
                conv.resolvedAt = new Date();
                await conv.save();

                if (io) {
                    const room = conv.business.toString(); // Note: might need population if business is just ID
                    io.to(room).emit('ticket_resolved', {
                        conversationId: conv._id.toString(),
                        status: conv.status,
                        reason: 'auto_resolved_due_to_inactivity'
                    });
                }
            }

            if (inactiveConversations.length > 0) {
                console.log(`🧹 Auto-resolved ${inactiveConversations.length} inactive conversations`);
            }
        } catch (error) {
            console.error("Auto-resolve error:", error);
        }
    }, 60 * 60 * 1000); // Check every hour
};
