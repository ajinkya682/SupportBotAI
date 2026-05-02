import Conversation from '../models/conversation.model.js';

export default (io) => {
    
    setInterval(async () => {
        try {
            const staleThreshold = new Date(Date.now() - 60 * 1000);

            const staleConversations = await Conversation.find({
                status: 'in_progress',
                updatedAt: { $lt: staleThreshold }
            })
            .populate({ path: 'business', select: 'owner' })
            .select('messages status business') 
            .lean(); 

            if (staleConversations.length === 0) return;

            await Promise.all(staleConversations.map(async (conv) => {
                if (!conv.messages?.length) return;

                const lastMsg = conv.messages[conv.messages.length - 1];
                let updatePayload = null;

                if (lastMsg.senderType === 'ai') {
                    updatePayload = {
                        status: 'ai_resolved',
                        resolvedByName: lastMsg.senderName || 'AI Assistant',
                        resolvedByType: 'ai'
                    };
                } 
                else if (['agent', 'owner'].includes(lastMsg.senderType)) {
                    updatePayload = {
                        status: 'human_resolved',
                        resolvedBy: lastMsg.sender?.id || 'manual',
                        resolvedByName: lastMsg.senderName || 'Support Agent',
                        resolvedByType: lastMsg.senderType
                    };
                }

                if (updatePayload) {
                    const resolvedAt = new Date();
                    
                    const updatedConv = await Conversation.findByIdAndUpdate(
                        conv._id,
                        { ...updatePayload, resolvedAt },
                        { new: true }
                    ).populate({ path: 'business', select: 'owner' });

                    const ownerId = updatedConv.business?.owner?.toString();
                    if (ownerId && io) {
                        io.to(ownerId).emit('ticket_resolved', {
                            conversationId: conv._id.toString(),
                            ...updatePayload,
                            resolvedAt,
                            autoResolved: true
                        });
                        
                        io.to(ownerId).emit('update_conversation', updatedConv);
                    }

                    console.log(`🕒 Auto-resolved conversation ${conv._id} (Last speaker: ${lastMsg.senderType})`);
                }
            }));
        } catch (error) {
            console.error("Auto-resolve service error:", error);
        }
    }, 20000); 
};