const Conversation = require('../models/Conversation');

module.exports = (io) => {
    setInterval(async () => {
        try {
            const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
            
            const staleConversations = await Conversation.find({
                status: 'in_progress',
                updatedAt: { $lt: oneMinuteAgo }
            }).populate('business');

            for (const conv of staleConversations) {
                if (!conv.messages || conv.messages.length === 0) continue;

                const lastMsg = conv.messages[conv.messages.length - 1];
                let newStatus = conv.status;
                let resolvedBy = null;
                let resolvedByName = null;
                let resolvedByType = null;

                if (lastMsg.senderType === 'ai') {
                    newStatus = 'ai_resolved';
                    resolvedByName = lastMsg.senderName || 'AI Assistant';
                    resolvedByType = 'ai';
                } else if (lastMsg.senderType === 'agent' || lastMsg.senderType === 'owner') {
                    newStatus = 'human_resolved';
                    resolvedBy = lastMsg.sender?.id || 'manual';
                    resolvedByName = lastMsg.senderName || 'Support Agent';
                    resolvedByType = lastMsg.senderType;
                } else if (lastMsg.senderType === 'user') {
                    continue; 
                }

                if (newStatus !== conv.status) {
                    conv.status = newStatus;
                    conv.resolvedBy = resolvedBy;
                    conv.resolvedByName = resolvedByName;
                    conv.resolvedByType = resolvedByType;
                    conv.resolvedAt = new Date();
                    await conv.save();

                    const ownerId = conv.business?.owner?.toString();
                    if (ownerId) {
                        io.to(ownerId).emit('ticket_resolved', {
                            conversationId: conv._id.toString(),
                            resolvedBy,
                            resolvedByName,
                            resolvedByType,
                            resolvedAt: conv.resolvedAt,
                            autoResolved: true
                        });
                        
                        io.to(ownerId).emit('update_conversation', conv);
                    }

                    console.log(`🕒 Auto-resolved conversation ${conv._id} (Last speaker: ${lastMsg.senderType})`);
                }
            }
        } catch (error) {
            console.error("Auto-resolve error:", error);
        }
    }, 20000);
};
