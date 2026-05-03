import { OpenAIEmbeddings } from "@langchain/openai";
import config from '../config/config.js';

let embeddingsModel = null;

const getEmbeddingsModel = () => {
    if (!embeddingsModel) {
        if (!config.OPENAI_API_KEY) {
            throw new Error("OPENAI_API_KEY is required for embeddings but not configured");
        }
        
        embeddingsModel = new OpenAIEmbeddings({
            apiKey: config.OPENAI_API_KEY,
            modelName: "text-embedding-3-small",
            stripNewLines: true,
        });
    }
    return embeddingsModel;
};

export const generateEmbedding = async (text) => {
    if (!text || typeof text !== 'string') {
        throw new Error("Text must be a non-empty string");
    }

    try {
        const embeddings = getEmbeddingsModel();
        const result = await embeddings.embedQuery(text.substring(0, 8191));
        return result;
    } catch (error) {
        console.error("Embedding generation error:", error);
        throw new Error(`Failed to generate embedding: ${error.message}`);
    }
};

export const generateEmbeddings = async (texts = []) => {
    if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error("Texts must be a non-empty array");
    }

    try {
        const embeddings = getEmbeddingsModel();
        const validTexts = texts.map(t => (t || '').substring(0, 8191)).filter(Boolean);
        
        if (validTexts.length === 0) {
            throw new Error("No valid texts to embed");
        }

        const results = await embeddings.embedDocuments(validTexts);
        return results;
    } catch (error) {
        console.error("Batch embedding generation error:", error);
        throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
};
