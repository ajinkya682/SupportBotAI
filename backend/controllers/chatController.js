const { Mistral } = require('@mistralai/mistralai');
const Business = require('../models/Business');
const Conversation = require('../models/Conversation');
const PlatformConfig = require('../models/PlatformConfig');
const cache = require('../utils/cache');

// Named constants — no magic numbers
const AI_MODEL = process.env.AI_MODEL || 'mistral-large-latest';
const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS) || 1024;
const TITLE_MODEL = 'mistral-small-latest';
const NAME_MAX_LENGTH = 20;

const mistral = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY || '',
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const analyzeMessage = (text) => {
  const lowerText = text.toLowerCase();

  const angryWords = ['hate', 'worst', 'angry', 'terrible', 'scam', 'refund', 'sue', 'legal', 'bad service'];
  const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quickly', 'emergency'];

  let emotion = 'neutral';
  if (angryWords.some((word) => lowerText.includes(word))) emotion = 'angry';
  else if (urgentWords.some((word) => lowerText.includes(word))) emotion = 'urgent';

  let intent = 'general_query';
  if (lowerText.includes('price') || lowerText.includes('cost') || lowerText.includes('pay')) {
    intent = 'billing';
  } else if (lowerText.includes('help') || lowerText.includes('how to') || lowerText.includes('not working')) {
    intent = 'technical_support';
  } else if (lowerText.includes('cancel') || lowerText.includes('delete') || lowerText.includes('refund')) {
    intent = 'account_management';
  }

  return { emotion, intent };
};

const extractNameFromMessage = (text) => {
  const namePatterns = [
    /my name is (.*?)(\.|$|!)/i,
    /i am (.*?)(\.|$|!)/i,
    /call me (.*?)(\.|$|!)/i,
    /this is (.*?)(\.|$|!)/i,
  ];
  for (const pattern of namePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const name = match[1].trim().split(' ')[0];
      return name.length > NAME_MAX_LENGTH ? name.substring(0, NAME_MAX_LENGTH) : name;
    }
  }
  return null;
};

const buildSystemPrompt = (business, visitorName, emotion, intent) => {
  const botName = business.appearance?.botName || business.name || 'SupportBotAI';
  const faqContext = business.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
  const visitorInstruction =
    visitorName === 'the user'
      ? 'Unknown. On your FIRST reply ONLY, after briefly acknowledging their message, naturally ask for their name. Do not ask again after that.'
      : `You are speaking with ${visitorName}. Use their name naturally in conversation where appropriate.`;

  return `
    You are "${botName}", a professional and friendly AI support assistant for "${business.name}".
    GOAL: Resolve customer issues instantly with high empathy. Sound like a warm, knowledgeable human — never robotic.
    VISITOR NAME: ${visitorInstruction}
    KNOWLEDGE BASE:\n${business.knowledge}
    FAQS:\n${faqContext}
    USER CONTEXT:
    - Detected Intent: ${intent}
    - Detected Emotion: ${emotion}
    - Support Email: ${business.supportEmail}
    STRICT GUIDELINES:
    1. Be professional, concise, warm, and helpful. Sound human.
    2. If the user is ${emotion === 'angry' ? 'angry, acknowledge their frustration with genuine empathy first' : emotion}.
    3. Start your response with [CONFIDENCE: High] if you know the EXACT answer from your knowledge base.
    4. Start your response with [CONFIDENCE: Low] if you are unsure. DO NOT GUESS.
    5. If you use [CONFIDENCE: Low], explicitly state that you are escalating to a human agent.
  `;
};

const generateConversationTitle = async (lastUserMessage, intent) => {
  try {
    const titleGen = await mistral.chat.complete({
      model: TITLE_MODEL,
      messages: [
        {
          role: 'system',
          content:
            'Create a ultra-short (2-3 words) descriptive title for this conversation based on the user\'s intent. Examples: "Pricing Query", "Login Help", "Refund Request". Reply ONLY with the title.',
        },
        { role: 'user', content: lastUserMessage },
      ],
    });
    return titleGen.choices[0].message.content.replace(/['"]/g, '');
  } catch {
    return intent.replace('_', ' ').charAt(0).toUpperCase() + intent.replace('_', ' ').slice(1);
  }
};

const emitConversationUpdate = (io, ownerId, conversation, aiMsg) => {
  if (!io || !ownerId) return;
  const room = ownerId.toString();
  io.to(room).emit('update_conversation', conversation);
  if (aiMsg) {
    io.to(room).emit('new_message', {
      conversationId: conversation._id.toString(),
      ...aiMsg,
    });
  }
};

// ── Handle Chat ───────────────────────────────────────────────────────────────

exports.handleChat = async (req, res) => {
  const { apiKey, messages, conversationId, userName } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key missing' });

  try {
    const config = await PlatformConfig.findOne();
    if (config && config.maintenanceMode) {
      return res.status(503).json({ 
        error: 'System Maintenance', 
        message: 'The platform is currently undergoing maintenance. Please try again later.' 
      });
    }
    let business = cache.get(apiKey);
    if (!business) {
      business = await Business.findOne({ apiKey });
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
    const { emotion, intent } = analyzeMessage(lastUserMessage);
    const visitorName = userName || 'the user';

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

      // ── ESCALATED CHAT (Human Agent is Active) ──────────────────────────
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

          // ── PUSH NOTIFICATION FOR ASSIGNED AGENT ────────────────────────
          if (conversation.agent) {
              const pushService = require('../utils/pushService');
              await pushService.sendNotification(conversation.agent, {
                  type: 'message',
                  title: `💬 New message from ${conversation.userName || 'User'}`,
                  body: lastUserMessage.substring(0, 60) + (lastUserMessage.length > 60 ? '...' : ''),
                  sound: 'message',
                  data: {
                      url: `/dashboard`,
                      conversationId: conversation._id
                  }
              });
          }
        }

        return res.json({
          content: null,
          conversationId: conversation._id,
          ownerId: business.owner.toString(),
          status: conversation.status,
          isAiActive: false,
          userName: conversation.userName,
        });
      }
    }

    // ── AI CHAT (AI is Active) ──────────────────────────────────────────────
    const systemPrompt = buildSystemPrompt(business, visitorName, emotion, intent);
    const chatResponse = await mistral.chat.complete({
      model: AI_MODEL,
      maxTokens: AI_MAX_TOKENS,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
    });

    const aiReplyRaw = chatResponse.choices[0].message.content;
    const confidenceMatch = aiReplyRaw.match(/\[CONFIDENCE:\s*(.*?)\]/i);
    const confidence = confidenceMatch ? confidenceMatch[1].trim() : 'High';
    const aiReply = aiReplyRaw.replace(/\[CONFIDENCE:\s*(.*?)\]/i, '').trim();

    const extractedName = extractNameFromMessage(lastUserMessage);
    const needsEscalation =
      confidence.toLowerCase() === 'low' ||
      emotion === 'angry' ||
      intent === 'account_management';

    if (conversationId) {
      // (Conversation already found above)

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

      const isUntitled =
        !conversation.title ||
        conversation.title === 'New Conversation' ||
        conversation.title.includes('Support Chat');

      if (conversation.messages.length >= 2 && isUntitled) {
        conversation.title = await generateConversationTitle(lastUserMessage, intent);
      }

      if (
        needsEscalation &&
        conversation.status !== 'human_needed' &&
        conversation.status !== 'in_progress'
      ) {
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
              createdAt: new Date(),
              isRead: false,
            },
          },
        });

        await conversation.save();

        if (req.io && business.owner) {
          const { routeTicket } = require('../utils/routing');
          await routeTicket(conversation._id, req.io);
          req.io.to(business.owner.toString()).emit('new_ticket', conversation);

          // ── PUSH NOTIFICATION FOR OWNER ──────────────────────────────────
          const pushService = require('../utils/pushService');
          const isHighIntent = conversation.priority === 'high';
          
          await pushService.sendNotification(business.owner, {
              type: isHighIntent ? 'high_intent' : 'new_ticket',
              title: isHighIntent ? '🔴 High Intent Ticket Created' : '🎫 New Support Ticket',
              body: `${conversation.userName || 'Guest'} needs help with ${intent.replace('_', ' ')}.`,
              sound: isHighIntent ? 'high_intent' : 'new_ticket',
              data: {
                  url: `/dashboard`,
                  conversationId: conversation._id
              }
          });
        }
      } else {
        await conversation.save();
        emitConversationUpdate(req.io, business.owner, conversation, aiMsg);
      }
    } else {
      // New conversation
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
        origin: req.body.origin || null,
        title:
          intent.replace('_', ' ').charAt(0).toUpperCase() + intent.replace('_', ' ').slice(1),
      });

      if (req.io && business.owner) {
        if (needsEscalation) {
          const { routeTicket } = require('../utils/routing');
          await routeTicket(conversation._id, req.io);
        }
        req.io.to(business.owner.toString()).emit('new_ticket', conversation);
      }

      await Business.findByIdAndUpdate(business._id, { $inc: { conversationCount: 1 } });
      cache.del(apiKey);
    }

    res.json({
      content: aiReply,
      conversationId: conversation._id,
      ownerId: business.owner.toString(),
      status: conversation.status,
      userName: conversation.userName,
      title: conversation.title,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ error: 'AI Assistant Error', details: error.message });
  }
};

// ── Agent Suggestion ──────────────────────────────────────────────────────────

exports.getAgentSuggestion = async (req, res) => {
  const { conversationId } = req.body;
  try {
    const conversation = await Conversation.findById(conversationId).populate('business');
    if (!conversation) return res.status(404).json({ error: 'Conversation not found' });

    const business = conversation.business;
    const faqContext = (business.faqs || []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    const conversationHistory = conversation.messages
      .map((m) => `${m.role === 'assistant' ? 'AI' : 'CUSTOMER'}: ${m.content}`)
      .join('\n');

    const systemPrompt = `
      You are assisting a support agent for "${business.name}".
      The customer is ${conversation.userName || 'Visitor'}.
      KNOWLEDGE BASE:\n${business.knowledge || 'General customer support'}
      FAQS:\n${faqContext || 'No specific FAQs provided.'}
      TASK: Suggest a perfect, human-like reply for the agent to send.
      - Speak directly as the agent (e.g., "Hello! I can certainly help with that...").
      - Keep it professional, warm, and helpful.
      - Reference knowledge base/FAQs if they contain the answer.
      - Keep the response concise (max 3 sentences unless complex).
      CONVERSATION HISTORY:\n${conversationHistory}
    `;

    const chatResponse = await mistral.chat.complete({
      model: TITLE_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'What should I say next to help this customer?' },
      ],
    });

    if (!chatResponse.choices || chatResponse.choices.length === 0) {
      throw new Error('Mistral returned an empty response.');
    }

    res.json({ suggestion: chatResponse.choices[0].message.content });
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    res.status(500).json({
      error: 'AI Suggestion failed',
      details: error.message,
      tip: 'Ensure your MISTRAL_API_KEY is valid and has remaining quota.',
    });
  }
};

// ── Widget Config ─────────────────────────────────────────────────────────────

exports.getWidgetConfig = async (req, res) => {
  try {
    const { apiKey } = req.params;
    const origin = req.headers.origin || req.headers.referer || '';

    if (!origin) {
      return res.status(400).json({ message: 'Origin header missing. Cannot verify domain.' });
    }

    let currentDomain = origin
      .replace(/^(https?:\/\/)/, '')
      .replace(/\/$/, '')
      .split('/')[0]
      .toLowerCase()
      .replace(/^www\./, '');

    const business = await Business.findOne({ apiKey });
    if (!business) return res.status(404).json({ message: 'Invalid API Key' });

    const domainLimit = business.plan === 'free' ? 1 : 10;
    const currentDomains = business.allowedDomains || [];
    const isAuthorized = currentDomains.includes(currentDomain);

    if (!isAuthorized) {
      if (currentDomains.length < domainLimit) {
        business.allowedDomains.push(currentDomain);
        await business.save();
      } else {
        return res.status(403).json({
          error: 'Domain Limit Reached',
          message: `This chatbot is restricted to ${domainLimit} website(s) on your current ${business.plan} plan.`,
          limitReached: true,
          plan: business.plan,
        });
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
    console.error('Widget Config Error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Get Conversation for Widget ───────────────────────────────────────────────

exports.getConversationForWidget = async (req, res) => {
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

// ── Update Conversation Status ────────────────────────────────────────────────

exports.updateConversationStatus = async (req, res) => {
  try {
    const { conversationId, status, resolvedBy, resolvedByName, resolvedByType } = req.body;
    if (!conversationId || !status) {
      return res.status(400).json({ message: 'Conversation ID and status are required' });
    }

    const conversation = await Conversation.findById(conversationId).populate('business');
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
