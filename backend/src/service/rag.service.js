const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_OVERLAP = 250;
const MAX_SNIPPETS = 4;
const MAX_SNIPPET_LENGTH = 2200;

import * as pineconeService from './pinecone.service.js';

const normalizeText = (text = '') => {
    return text
        .replace(/[\u2018\u2019\u201c\u201d]/g, "'")
        .replace(/[\r\n]+/g, ' ')
        .replace(/[^a-z0-9\s]/gi, ' ')
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .trim();
};

const tokenize = (text = '') => normalizeText(text).split(' ').filter(Boolean);

const splitTextIntoChunks = (text, chunkSize = DEFAULT_CHUNK_SIZE, overlap = DEFAULT_OVERLAP) => {
    const cleaned = text?.trim();
    if (!cleaned) return [];

    const chunks = [];
    let start = 0;

    while (start < cleaned.length) {
        let end = Math.min(start + chunkSize, cleaned.length);
        if (end < cleaned.length) {
            const boundary = cleaned.lastIndexOf('.', end);
            if (boundary > start) end = boundary + 1;
        }

        const chunk = cleaned.slice(start, end).trim();
        if (!chunk) break;

        chunks.push(chunk);
        if (end >= cleaned.length) break;
        start = Math.max(0, end - overlap);
    }

    return chunks;
};

export const createKnowledgeChunksFromText = (text, sourceUrl = null) => {
    if (!text) return [];

    return splitTextIntoChunks(text).map((content, index) => ({
        content,
        sourceUrl,
        chunkIndex: index + 1,
        createdAt: new Date()
    }));
};

export const createKnowledgeChunksFromPages = (pages = []) => {
    const chunks = [];

    pages.forEach(page => {
        if (!page || !page.text) return;
        const pageChunks = splitTextIntoChunks(page.text);

        pageChunks.forEach((content) => {
            chunks.push({
                content,
                sourceUrl: page.url || null,
                chunkIndex: chunks.length + 1,
                createdAt: new Date()
            });
        });
    });

    return chunks;
};

const scoreChunk = (query, chunkContent) => {
    const queryTokens = tokenize(query);
    const chunkTokens = tokenize(chunkContent);
    const querySet = new Set(queryTokens);
    const overlap = chunkTokens.filter(token => querySet.has(token)).length;

    const baseScore = queryTokens.length && chunkTokens.length
        ? overlap / Math.sqrt(queryTokens.length * chunkTokens.length)
        : 0;

    const exactPhraseBonus = normalizeText(chunkContent).includes(normalizeText(query)) ? 0.25 : 0;
    return baseScore + exactPhraseBonus;
};

export const rankChunksByQuery = (query, chunks = []) => {
    if (!query || !chunks.length) return [];

    return chunks
        .map(chunk => ({
            chunk,
            score: scoreChunk(query, chunk.content)
        }))
        .filter(result => result.score > 0)
        .sort((a, b) => b.score - a.score);
};

export const buildRetrievalContext = async (businessKnowledgeChunks = [], messages = [], businessId = null, topK = MAX_SNIPPETS) => {
    const query = Array.isArray(messages)
        ? messages.map(m => m.content || '').join(' ')
        : String(messages || '');

    if (!query) return '';

    try {
        if (pineconeService.isPineconeEnabled() && businessId) {
            try {
                const pineconeResults = await pineconeService.retrieveFromPinecone(query, businessId, topK);
                if (pineconeResults.length > 0) {
                    const snippets = pineconeResults.map((result, index) => {
                        const source = result.sourceUrl ? `Source: ${result.sourceUrl}` : `Snippet ${index + 1}`;
                        return `${source}\n${result.content}`;
                    });

                    const joined = snippets.join('\n\n');
                    return joined.length > MAX_SNIPPET_LENGTH ? joined.slice(0, MAX_SNIPPET_LENGTH) : joined;
                }
            } catch (error) {
                console.warn("Pinecone retrieval failed, falling back to local:", error.message);
            }
        }
    } catch (error) {
        console.warn("Pinecone check failed:", error.message);
    }

    let chunks = [];
    if (Array.isArray(businessKnowledgeChunks) && businessKnowledgeChunks.length) {
        chunks = businessKnowledgeChunks;
    } else if (typeof businessKnowledgeChunks === 'string' && businessKnowledgeChunks.trim()) {
        chunks = createKnowledgeChunksFromText(businessKnowledgeChunks);
    }

    const ranked = rankChunksByQuery(query, chunks).slice(0, topK);
    if (!ranked.length) return '';

    const snippets = ranked.map((result, index) => {
        const source = result.chunk.sourceUrl ? `Source: ${result.chunk.sourceUrl}` : `Snippet ${index + 1}`;
        return `${source}\n${result.chunk.content}`;
    });

    const joined = snippets.join('\n\n');
    return joined.length > MAX_SNIPPET_LENGTH ? joined.slice(0, MAX_SNIPPET_LENGTH) : joined;
};
