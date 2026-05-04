import { Mistral } from '@mistralai/mistralai';
import Business from '../models/business.model.js';
import Conversation from '../models/conversation.model.js';
import cache from '../utils/cache.js';
import * as aiService from '../service/ai.service.js';
import { routeTicket } from '../utils/routing.js';

const mistral = new Mistral({
    apiKey: process.env.MISTRAL_API_KEY || '',
});

export const handleChat = async (req, res) => {
    const { apiKey, messages, conversationId, userName } = req.body;
    if (!apiKey) return res.status(400).json({ error: 'API Key missing' });

    try {
        let business = cache.get(apiKey);
        if (!business) {
            business = await Business.findOne({ apiKey }).lean();
            if (!business) return res.status(404).json({ error: 'Invalid API Key' });
            cache.set(apiKey, business);
        }

        if (business.plan === 'free' && business.conversationCount >= business.conversationLimit) {
            return res.status(403).json({
                error: 'Conversation limit reached',
                message: 'This business has reached its conversation limit. Please upgrade to Pro.',
            });
        }

        const botName = business.appearance?.botName || business.name || 'SupportBotAI';
        const botAvatar = business.appearance?.botAvatar || '';
        const lastUserMessage = messages[messages.length - 1].content;
        const { emotion, intent } = aiService.analyzeMessage(lastUserMessage);
        
        // Fetch AI reply using improved service
        const { content: aiReply, confidence } = await aiService.getAiResponse(
            business,
            messages,
            userName || 'the user',
            emotion,
            intent
        );

        const extractedName = aiService.extractNameFromMessage(lastUserMessage);
        const needsEscalation =
            confidence.toLowerCase() === 'low' ||
            emotion === 'angry' ||
            intent === 'account_management';

        let conversation;

        if (conversationId) {
            conversation = await Conversation.findById(conversationId);
            if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

            if (conversation.isAiActive === false) {
                const userMsg = {
                    role: 'user',
                    content: lastUserMessage,
                    timestamp: new Date(),
                    senderType: 'user',
                    senderName: conversation.userName || 'User',
                };
                conversation.messages.push(userMsg);
                await conversation.save();

                if (req.io && business.owner) {
                    const room = business.owner.toString();
                    req.io.to(room).emit('new_message', {
                        conversationId: conversation._id.toString(),
                        ...userMsg,
                    });
                    req.io.to(room).emit('update_conversation', conversation);
                }

                return res.json({
                    content: null,
                    conversationId: conversation._id,
                    status: conversation.status,
                    isAiActive: false,
                    userName: conversation.userName,
                });
            }

            if (extractedName && (!conversation.userName || conversation.userName === 'Anonymous')) {
                conversation.userName = extractedName;
            }

            const userMsg = {
                role: 'user',
                content: lastUserMessage,
                timestamp: new Date(),
                senderType: 'user',
                senderName: conversation.userName || 'User',
            };
            const aiMsg = {
                role: 'assistant',
                content: aiReply,
                timestamp: new Date(),
                senderType: 'ai',
                senderName: botName,
                senderAvatar: botAvatar,
            };

            conversation.messages.push(userMsg, aiMsg);
            conversation.emotion = emotion;
            conversation.intent = intent;
            conversation.updatedAt = new Date();

            if (needsEscalation && conversation.status !== 'human_needed' && conversation.status !== 'in_progress') {
                conversation.status = 'human_needed';
                conversation.priority = emotion === 'angry' ? 'high' : 'medium';

                if (confidence === 'Low') {
                    conversation.messages.push({
                        role: 'assistant',
                        content: `I've notified our support team, and a human agent will join this chat shortly to help you with ${intent.replace('_', ' ')}! 😊`,
                        timestamp: new Date(),
                        senderType: 'ai',
                        senderName: botName,
                        senderAvatar: botAvatar,
                    });
                }

                await Business.findByIdAndUpdate(business._id, {
                    $push: {
                        notifications: {
                            message: `Ticket Created: ${conversation.userName} needs help with ${intent}.`,
                            isRead: false,
                        },
                    },
                });

                await conversation.save();
                if (req.io) await routeTicket(conversation._id, req.io);
            } else {
                await conversation.save();
                if (req.io && business.owner) {
                    const room = business.owner.toString();
                    req.io.to(room).emit('update_conversation', conversation);
                    req.io.to(room).emit('new_message', { conversationId: conversation._id.toString(), ...aiMsg });
                }
            }
        } else {
            // New conversation
            const title = await aiService.generateConversationTitle(lastUserMessage, intent);
            const userMsg = {
                role: 'user',
                content: lastUserMessage,
                timestamp: new Date(),
                senderType: 'user',
                senderName: extractedName || 'Anonymous',
            };
            const aiMsg = {
                role: 'assistant',
                content: aiReply,
                timestamp: new Date(),
                senderType: 'ai',
                senderName: botName,
                senderAvatar: botAvatar,
            };

            conversation = await Conversation.create({
                business: business._id,
                messages: [userMsg, aiMsg],
                emotion,
                intent,
                status: needsEscalation ? 'human_needed' : 'ai_resolved',
                routingStatus: needsEscalation ? 'pending' : 'resolved',
                priority: emotion === 'angry' ? 'high' : needsEscalation ? 'medium' : 'low',
                userName: extractedName || 'Anonymous',
                title,
            });

            if (req.io && needsEscalation) {
                await routeTicket(conversation._id, req.io);
            }

            await Business.findByIdAndUpdate(business._id, { $inc: { conversationCount: 1 } });
            cache.del(apiKey);
        }

        res.json({
            content: aiReply,
            conversationId: conversation._id,
            status: conversation.status,
            userName: conversation.userName,
            title: conversation.title,
        });
    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ error: 'AI Assistant Error', details: error.message });
    }
};

export const getAgentSuggestion = async (req, res) => {
    const { conversationId } = req.body;
    try {
        const conversation = await Conversation.findById(conversationId).populate('business');
        if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

        const suggestion = await aiService.getAgentSuggestion(
            conversation.business.name,
            conversation.business,
            conversation.messages
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

        const domainLimit = business.plan === 'free' ? 1 : 10;
        const currentDomains = business.allowedDomains || [];
        if (!currentDomains.includes(origin) && origin !== "") {
            if (currentDomains.length < domainLimit) {
                await Business.updateOne({ _id: business._id }, { $push: { allowedDomains: origin } });
            } else {
                return res.status(403).json({ error: 'Unauthorized domain. Limit reached.' });
            }
        }

        res.json({
            name: business.name,
            ownerId: business.owner.toString(),
            faqs: business.faqs,
            appearance: business.appearance,
            plan: business.plan,
            allowedDomains: business.allowedDomains,
        });
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

export const updateConversationStatus = async (req, res) => {
    try {
        const { conversationId, status, resolvedBy, resolvedByName, resolvedByType } = req.body;
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

        let finalStatus = status;
        if (status === 'solved') {
            finalStatus = conversation.isAiActive ? 'ai_resolved' : 'human_resolved';
        }

        conversation.status = finalStatus;
        if (resolvedByName) {
            conversation.resolvedByName = resolvedByName;
            conversation.resolvedByType = resolvedByType;
            conversation.resolvedBy = resolvedBy;
            conversation.resolvedAt = new Date();
        }
        await conversation.save();

        res.json({ success: true, status: finalStatus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};