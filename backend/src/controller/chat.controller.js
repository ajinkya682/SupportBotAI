import Business from '../models/business.model.js';
import Conversation from '../models/conversation.model.js';
import cache from '../utils/cache.js';
import * as aiService from '../service/ai.service.js';



export const handleChat = async (req, res) => {
    const { apiKey, messages, conversationId, userName } = req.body;

    if (!apiKey) return res.status(400).json({ error: 'API Key missing' });

    try {
        // 1. Business Retrieval (Cache First Strategy)
        let business = cache.get(apiKey);
        if (!business) {
            business = await Business.findOne({ apiKey }).lean();
            if (!business) return res.status(404).json({ error: 'Invalid API Key' });

            // Setting cache (default 1 hour TTL)
            cache.set(apiKey, business);
        }

        // 2. Usage & Plan Limit Check
        const currentCount = business.conversationCount || 0;
        const limit = business.conversationLimit || 0;

        if (business.plan === 'free' && currentCount >= limit) {
            return res.status(403).json({ error: 'Conversation limit reached' });
        }

        // 3. AI Analysis & Response Generation
        const lastUserMessage = messages[messages.length - 1].content;

        // Sentiment and Intent analysis
        const { emotion, intent } = aiService.analyzeMessage(lastUserMessage);
        const extractedName = aiService.extractNameFromMessage(lastUserMessage);

        // Fetch AI reply using extracted service
        const { content: aiReply, confidence } = await aiService.getAiResponse(
            business,
            messages,
            userName || 'the user',
            emotion,
            intent
        );

        // Escalation Logic (Angry users or low confidence AI)
        const needsEscalation = confidence === 'Low' || emotion === 'angry' || intent === 'account_management';

        // 4. Message Objects Preparation
        const userMsg = {
            role: 'user',
            content: lastUserMessage,
            timestamp: new Date(),
            senderType: 'user',
            senderName: userName || extractedName || 'User'
        };

        const aiMsg = {
            role: 'assistant',
            content: aiReply,
            timestamp: new Date(),
            senderType: 'ai',
            senderName: business.appearance?.botName || 'AI Assistant'
        };

        let conversation;

        // 5. Conversation Persistence Logic
        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

            // CASE: Human Agent is already handling this chat
            if (conversation.isAiActive === false) {
                conversation.messages.push(userMsg);
                await conversation.save();

                // Emit only user message to dashboard
                req.io?.to(business.owner.toString()).emit('new_message', { conversationId, ...userMsg });

                return res.json({ content: null, conversationId, isAiActive: false });
            }

            // Sync user name if found during chat
            if (extractedName && (!conversation.userName || conversation.userName === 'Anonymous')) {
                conversation.userName = extractedName;
            }

            conversation.messages.push(userMsg, aiMsg);
        } else {
            // CASE: New Conversation Initialization
            const title = await aiService.generateConversationTitle(lastUserMessage, intent);

            conversation = new Conversation({
                business: business._id,
                messages: [userMsg, aiMsg],
                userName: userName || extractedName || 'Anonymous',
                title,
                status: 'open'
            });

            // Increment usage and clear cache to keep data fresh
            await Business.findByIdAndUpdate(business._id, { $inc: { conversationCount: 1 } });
            cache.del(apiKey);
        }

        // 6. Meta-data & Status Updates
        conversation.emotion = emotion;
        conversation.intent = intent;

        if (needsEscalation && !['human_needed', 'in_progress'].includes(conversation.status)) {
            conversation.status = 'human_needed';
            conversation.priority = emotion === 'angry' ? 'high' : 'medium';

            // Add notification for the business owner
            await Business.findByIdAndUpdate(business._id, {
                $push: {
                    notifications: {
                        message: `Action Required: ${conversation.userName} needs assistance with ${intent}`,
                        isRead: false
                    }
                }
            });
        }

        await conversation.save();

        // 7. Real-time Socket Synchronization
        if (req.io && business.owner) {
            const room = business.owner.toString();
            // Update the sidebar/list in dashboard
            req.io.to(room).emit('update_conversation', conversation);
            // Send the new AI reply to dashboard chat window
            req.io.to(room).emit('new_message', { conversationId: conversation._id, ...aiMsg });
        }

        // 8. Final Response to Widget
        res.json({
            content: aiReply,
            conversationId: conversation._id,
            status: conversation.status,
            userName: conversation.userName
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({
            error: 'Internal Server Error',
            details: error.message
        });
    }
};


export const getAgentSuggestion = async (req, res) => {
    try {
        const { conversationId } = req.body;
        const conv = await Conversation.findById(conversationId).populate('business').lean();
        if (!conv) return res.status(404).json({ error: 'Conversation not found' });

        const history = conv.messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');
        const suggestion = await aiService.getAgentSuggestion(
            conv.business.name,
            conv.business.knowledge,
            history
        );

        res.json({ suggestion });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getWidgetConfig = async (req, res) => {
    try {
        const { apiKey } = req.params;
        const rawOrigin = req.headers.origin || req.headers.referer || '';
        const origin = rawOrigin.replace(/^https?:\/\/|www\.|(?<=\/)\/.*$/g, '').replace(/\/$/, '').toLowerCase();

        const business = await Business.findOne({ apiKey });
        if (!business) return res.status(404).json({ message: 'Invalid API Key' });

        // Domain Security Check
        const domainLimit = business.plan === 'free' ? 1 : 10;
        if (!business.allowedDomains.includes(origin) && origin !== "") {
            if (business.allowedDomains.length < domainLimit) {
                await Business.updateOne({ _id: business._id }, { $push: { allowedDomains: origin } });
            } else {
                return res.status(403).json({ error: 'Unauthorized domain. Limit reached.' });
            }
        }

        res.json({
            name: business.name,
            ownerId: business.owner,
            faqs: business.faqs,
            appearance: business.appearance,
            plan: business.plan
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const updateConversationStatus = async (req, res) => {
    try {
        const { conversationId, status, resolvedBy, resolvedByName, resolvedByType } = req.body;
        const conv = await Conversation.findById(conversationId);
        if (!conv) return res.status(404).json({ error: "Not found" });

        let finalStatus = status === 'solved' ? (conv.isAiActive ? 'ai_resolved' : 'human_resolved') : status;

        const update = {
            status: finalStatus,
            resolvedAt: status === 'solved' ? new Date() : null,
            resolvedBy,
            resolvedByName,
            resolvedByType
        };

        const updatedConv = await Conversation.findByIdAndUpdate(
            conversationId,
            { $set: update },
            { new: true }
        );

        res.json({ success: true, conversation: updatedConv });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getConversationForWidget = async (req, res) => {
    try {
        const { id } = req.params;
        const conversation = await Conversation.findById(id).populate(
            'agent',
            'displayName profilePhoto roleTitle'
        );
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        res.json({
            messages: conversation.messages,
            isAiActive: conversation.isAiActive,
            userName: conversation.userName,
            status: conversation.status,
            agent: conversation.agent
                ? {
                    displayName: conversation.agent.displayName,
                    profilePhoto: conversation.agent.profilePhoto,
                    roleTitle: conversation.agent.roleTitle,
                }
                : null,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};