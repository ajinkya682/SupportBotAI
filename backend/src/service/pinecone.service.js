import { Pinecone } from "@pinecone-database/pinecone";
import config from '../config/config.js';
import * as embeddingsService from './embeddings.service.js';

let pineconeClient = null;
let pineconeIndex = null;

const getPineconeClient = () => {
    if (!pineconeClient) {
        if (!config.PINECONE_API_KEY || !config.PINECONE_ENVIRONMENT) {
            throw new Error("Pinecone not configured. Set PINECONE_API_KEY and PINECONE_ENVIRONMENT.");
        }

        pineconeClient = new Pinecone({
            apiKey: config.PINECONE_API_KEY,
        });
    }
    return pineconeClient;
};

const getPineconeIndex = async () => {
    if (!pineconeIndex) {
        if (!config.PINECONE_INDEX_NAME) {
            throw new Error("PINECONE_INDEX_NAME is not configured");
        }

        const client = getPineconeClient();
        pineconeIndex = client.Index(config.PINECONE_INDEX_NAME);
    }
    return pineconeIndex;
};

export const storeChunksInPinecone = async (chunks = [], businessId = null) => {
    if (!Array.isArray(chunks) || chunks.length === 0) {
        throw new Error("Chunks must be a non-empty array");
    }

    if (!businessId) {
        throw new Error("Business ID is required for vector storage");
    }

    try {
        const index = await getPineconeIndex();
        
        const vectorsToUpsert = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            if (!chunk.content) continue;

            const embedding = await embeddingsService.generateEmbedding(chunk.content);
            const vectorId = `${businessId}_chunk_${chunk.chunkIndex || i}`;

            vectorsToUpsert.push({
                id: vectorId,
                values: embedding,
                metadata: {
                    businessId: businessId.toString(),
                    chunkIndex: chunk.chunkIndex || i,
                    sourceUrl: chunk.sourceUrl || '',
                    content: chunk.content.substring(0, 1000),
                    createdAt: chunk.createdAt?.toISOString() || new Date().toISOString()
                }
            });
        }

        if (vectorsToUpsert.length === 0) {
            throw new Error("No valid chunks to store");
        }

        await index.upsert(vectorsToUpsert);
        console.log(`Stored ${vectorsToUpsert.length} vectors in Pinecone for business ${businessId}`);
        return { success: true, vectorsStored: vectorsToUpsert.length };
    } catch (error) {
        console.error("Pinecone storage error:", error);
        throw new Error(`Failed to store chunks in Pinecone: ${error.message}`);
    }
};

export const retrieveFromPinecone = async (query = '', businessId = null, topK = 4) => {
    if (!query || typeof query !== 'string') {
        throw new Error("Query must be a non-empty string");
    }

    if (!businessId) {
        throw new Error("Business ID is required for retrieval");
    }

    try {
        const queryEmbedding = await embeddingsService.generateEmbedding(query);
        const index = await getPineconeIndex();

        const results = await index.query({
            vector: queryEmbedding,
            topK,
            filter: {
                businessId: businessId.toString()
            },
            includeMetadata: true
        });

        const retrieved = results.matches
            .filter(m => m.score > 0.3)
            .map(m => ({
                content: m.metadata?.content || '',
                sourceUrl: m.metadata?.sourceUrl || '',
                chunkIndex: m.metadata?.chunkIndex || 0,
                score: m.score,
                id: m.id
            }));

        return retrieved;
    } catch (error) {
        console.error("Pinecone retrieval error:", error);
        throw new Error(`Failed to retrieve from Pinecone: ${error.message}`);
    }
};

export const deleteBusinessVectors = async (businessId = null) => {
    if (!businessId) {
        throw new Error("Business ID is required");
    }

    try {
        const index = await getPineconeIndex();

        await index.deleteMany({
            filter: {
                businessId: businessId.toString()
            }
        });

        console.log(`Deleted all vectors for business ${businessId} from Pinecone`);
        return { success: true };
    } catch (error) {
        console.error("Pinecone deletion error:", error);
        throw new Error(`Failed to delete vectors from Pinecone: ${error.message}`);
    }
};

export const isPineconeEnabled = () => {
    return Boolean(config.PINECONE_API_KEY && config.PINECONE_ENVIRONMENT && config.PINECONE_INDEX_NAME);
};
