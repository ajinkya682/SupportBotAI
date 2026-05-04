import { Mistral } from '@mistralai/mistralai';
import config from '../config/config.js';
import * as ragService from './rag.service.js';

const mistral = new Mistral({
    apiKey: config.MISTRAL_API_KEY || '',
});

const AI_MODEL = config.AI_MODEL || 'mistral-large-latest';
const TITLE_MODEL = 'mistral-small-latest';

export const analyzeMessage = (text) => {
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

export const extractNameFromMessage = (text) => {
    const namePatterns = [
        /my name is (.*?)(\.|$|!)/i,
        /i am (.*?)(\.|$|!)/i,
        /call me (.*?)(\.|$|!)/i,
        /this is (.*?)(\.|$|!)/i,
    ];
    for (const pattern of namePatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
            return match[1].trim().split(' ')[0].slice(0, 20);
        }
    }
    return null;
};

export const getAiResponse = async (business, messages, userName, emotion, intent) => {
    const botName = business.appearance?.botName || business.name || 'SupportBotAI';
    const faqContext = business.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    
    const knowledgeSource = Array.isArray(business.knowledgeChunks) && business.knowledgeChunks.length
        ? business.knowledgeChunks
        : business.knowledge;
    
    const knowledgeContext = await ragService.buildRetrievalContext(knowledgeSource, messages, business._id);

    const visitorInstruction =
        userName === 'the user'
            ? 'Unknown. On your FIRST reply ONLY, after briefly acknowledging their message, naturally ask for their name.'
            : `You are speaking with ${userName}. Use their name naturally in conversation.`;

    const systemPrompt = `
        You are "${botName}", a professional AI support assistant for "${business.name}".
        GOAL: Resolve customer issues with empathy. Sound warm and knowledgeable — never robotic.
        VISITOR NAME: ${visitorInstruction}
        KNOWLEDGE BASE:\n${knowledgeContext || 'No specific knowledge provided.'}
        FAQS:\n${faqContext}
        USER CONTEXT:
        - Detected Intent: ${intent}
        - Detected Emotion: ${emotion}
        - Support Email: ${business.supportEmail}
        STRICT GUIDELINES:
        1. Only use the information provided in the KNOWLEDGE BASE and FAQS.
        2. If you don't know the answer, say so and state that you are escalating to a human.
        3. Start your response with [CONFIDENCE: High] or [CONFIDENCE: Low].
        4. If user is angry, acknowledge frustration first.
    `;

    // Sanitize messages for Mistral SDK
    const formattedMessages = messages.map(m => ({
        role: m.role,
        content: m.content.replace(/{/g, '(').replace(/}/g, ')')
    }));

    const response = await mistral.chat.complete({
        model: AI_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...formattedMessages],
    });

    const rawReply = response.choices[0].message.content;
    const confidence = /\[CONFIDENCE:\s*Low\]/i.test(rawReply) ? 'Low' : 'High';
    const content = rawReply.replace(/\[CONFIDENCE:\s*(.*?)\]/i, '').trim();

    return { content, confidence };
};

export const generateConversationTitle = async (lastUserMessage, intent) => {
    try {
        const response = await mistral.chat.complete({
            model: TITLE_MODEL,
            messages: [
                {
                    role: 'system',
                    content: 'Create a short (2-3 words) title for this conversation. Reply ONLY with the title.',
                },
                { role: 'user', content: lastUserMessage },
            ],
        });
        return response.choices[0].message.content.replace(/['"]/g, '');
    } catch {
        return intent.replace('_', ' ').charAt(0).toUpperCase() + intent.replace('_', ' ').slice(1);
    }
};

export const getAgentSuggestion = async (businessName, business, messages) => {
    try {
        const faqContext = (business.faqs || []).map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
        const history = messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n');

        const systemPrompt = `
            You are assisting a support agent for "${businessName}".
            TASK: Suggest a perfect, human-like reply for the agent to send.
            - Reference knowledge base/FAQs if they contain the answer.
            - Keep it concise (max 3 sentences).
            FAQS:\n${faqContext}
            CONVERSATION HISTORY:\n${history}
        `;

        const response = await mistral.chat.complete({
            model: TITLE_MODEL,
            messages: [{ role: 'system', content: systemPrompt }],
        });

        return response.choices[0].message.content;
    } catch (error) {
        return "I'm sorry, I couldn't generate a suggestion at this time.";
    }
};