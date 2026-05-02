import { ChatMistralAI } from "@langchain/mistralai";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";
import config from '../config/config.js';


const model = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    modelName: config.AI_MODEL || "mistral-large-latest",
    maxTokens: config.AI_MAX_TOKENS || 1024,
});

const titleModel = new ChatMistralAI({
    apiKey: config.MISTRAL_API_KEY,
    modelName: "mistral-small-latest",
    temperature: 0, 
});

/**
 * Analyzes text for emotion and intent (Logic remains same)
 */
export const analyzeMessage = (text) => {
    const lowerText = text.toLowerCase();
    const angryWords = ['hate', 'worst', 'angry', 'terrible', 'scam', 'refund', 'sue', 'legal', 'bad service'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'now', 'quickly', 'emergency'];

    const emotion = angryWords.some(w => lowerText.includes(w)) ? 'angry' : 
                    urgentWords.some(w => lowerText.includes(w)) ? 'urgent' : 'neutral';

    let intent = 'general_query';
    if (/price|cost|pay/i.test(lowerText)) intent = 'billing';
    else if (/help|how to|not working/i.test(lowerText)) intent = 'technical_support';
    else if (/cancel|delete|refund/i.test(lowerText)) intent = 'account_management';

    return { emotion, intent };
};

/**
 * Extracts potential names (Regex logic same)
 */
export const extractNameFromMessage = (text) => {
    const patterns = [/my name is (.*?)(\.|$|!)/i, /i am (.*?)(\.|$|!)/i, /call me (.*?)(\.|$|!)/i, /this is (.*?)(\.|$|!)/i];
    for (const p of patterns) {
        const match = text.match(p);
        if (match?.[1]) {
            return match[1].trim().split(' ')[0].slice(0, 20);
        }
    }
    return null;
};

/**
 * Generates the main chat response using LangChain PromptTemplates
 */
export const getAiResponse = async (business, messages, userName, emotion, intent) => {
    const botName = business.appearance?.botName || business.name || 'SupportBotAI';
    const faqContext = business.faqs.map(f => `Q: ${f.question}\nA: ${f.answer}`).join('\n');
    
    const visitorInstruction = userName === 'the user' 
        ? 'Unknown. On your FIRST reply ONLY, naturally ask for their name.'
        : `You are speaking with ${userName}. Use their name naturally.`;

    
    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(
            `You are "{botName}", a professional AI assistant for "{businessName}".
            GOAL: Resolve customer issues with high empathy. Sound warm and human.
            VISITOR: {visitorInstruction}
            KNOWLEDGE BASE: {knowledge}
            FAQS: {faqs}
            CONTEXT: Intent: {intent} | Emotion: {emotion} | Support Email: {supportEmail}
            GUIDELINES:
            1. Concise and helpful.
            2. If user is angry, acknowledge frustration first.
            3. Start response with [CONFIDENCE: High] or [CONFIDENCE: Low]. 
            4. If [CONFIDENCE: Low], explicitly state you are escalating to a human.`
        ),
        
        ...messages.map(m => 
            m.role === 'user' 
            ? HumanMessagePromptTemplate.fromTemplate(m.content) 
            : SystemMessagePromptTemplate.fromTemplate(m.content)
        )
    ]);

    
    const chain = prompt.pipe(model);

    const response = await chain.invoke({
        botName,
        businessName: business.name,
        visitorInstruction,
        knowledge: business.knowledge,
        faqs: faqContext,
        intent,
        emotion,
        supportEmail: business.supportEmail
    });

    const rawReply = response.content;
    const confidence = /\[CONFIDENCE:\s*Low\]/i.test(rawReply) ? 'Low' : 'High';
    const content = rawReply.replace(/\[CONFIDENCE:\s*(.*?)\]/i, '').trim();

    return { content, confidence };
};

/**
 * Generates a title using a simple chain
 */
export const generateConversationTitle = async (lastUserMessage, intent) => {
    try {
        const prompt = ChatPromptTemplate.fromMessages([
            ["system", "Create a 2-3 word descriptive title for this user intent. Reply ONLY with the title."],
            ["human", "{input}"]
        ]);

        const chain = prompt.pipe(titleModel);
        const res = await chain.invoke({ input: lastUserMessage });
        
        return res.content.replace(/['"]/g, '');
    } catch {
        return intent.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
};

/**
 * Suggests a reply for human agent
 */
export const getAgentSuggestion = async (businessName, knowledge, history) => {
    const prompt = ChatPromptTemplate.fromMessages([
        ["system", "Suggest a concise human reply for {businessName}. KB: {knowledge}"],
        ["human", "History:\n{history}"]
    ]);

    const chain = prompt.pipe(titleModel);
    const res = await chain.invoke({
        businessName,
        knowledge,
        history
    });

    return res.content;
};