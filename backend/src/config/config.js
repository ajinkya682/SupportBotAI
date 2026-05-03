import 'dotenv/config';

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables")
}

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables")
}

if (!process.env.EMAIL_USER) {
    throw new Error("EMAIL_USER is not defined in environment variables")
}

if (!process.env.EMAIL_PASS && !(process.env.CLIENT_ID && process.env.CLIENT_SECRET && process.env.REFRESH_TOKEN)) {
    throw new Error("Email credentials are not properly configured. Please check your .env file.")
}

if (process.env.CLIENT_ID && (!process.env.CLIENT_SECRET || !process.env.REFRESH_TOKEN)) {
    throw new Error("Incomplete OAuth configuration. CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN must all be set for OAuth.")
}

if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables")
}

if (!process.env.SUPER_ADMIN_JWT_SECRET) {
    throw new Error("SUPER_ADMIN_JWT_SECRET is not defined in environment variables")
}

if (!process.env.IMAGEKIT_PUBLIC_KEY) {
    throw new Error("IMAGEKIT_PUBLIC_KEY is not defined in environment variables")
}

if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    throw new Error("IMAGEKIT_PRIVATE_KEY is not defined in environment variables")
}

if (!process.env.IMAGEKIT_URL_ENDPOINT) {
    throw new Error("IMAGEKIT_URL_ENDPOINT is not defined in environment variables")
}

if (!process.env.MISTRAL_API_KEY) {
    throw new Error("MISTRAL_API_KEY is not defined in environment variables")
}

if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not defined in environment variables")
}

const hasPineconeConfig = Boolean(process.env.PINECONE_API_KEY || process.env.PINECONE_ENVIRONMENT || process.env.PINECONE_INDEX_NAME);
if (hasPineconeConfig) {
    if (!process.env.PINECONE_API_KEY || !process.env.PINECONE_ENVIRONMENT || !process.env.PINECONE_INDEX_NAME) {
        throw new Error("Incomplete Pinecone configuration. Set PINECONE_API_KEY, PINECONE_ENVIRONMENT, and PINECONE_INDEX_NAME.")
    }
}

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const FRONTEND_URL = process.env.FRONTEND_URL?.trim() || '';
const ADDITIONAL_ORIGINS = process.env.ADDITIONAL_ORIGINS
  ? process.env.ADDITIONAL_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

const ALLOWED_ORIGINS = [...new Set([FRONTEND_URL, ...ADDITIONAL_ORIGINS].filter(Boolean))];

const config = {
    PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '30d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
    SUPER_ADMIN_EMAIL: process.env.SUPER_ADMIN_EMAIL,
    SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD,
    SUPER_ADMIN_JWT_SECRET: process.env.SUPER_ADMIN_JWT_SECRET,
    IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
    MISTRAL_API_KEY: process.env.MISTRAL_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    AI_MODEL: process.env.AI_MODEL || 'mistral-large-latest',
    AI_MAX_TOKENS: parseInt(process.env.AI_MAX_TOKENS) || 1024,
    PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
    PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT || '',
    PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME || '',
    SERVER_BASE_URL: process.env.SERVER_BASE_URL || '',
    API_URL: process.env.API_URL || `http://localhost:${PORT}`,
    ALLOWED_ORIGINS,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS ? Number(process.env.RATE_LIMIT_MAX_REQUESTS) : 100,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 900000,
    scraper: {
        MAX_PAGES: parseInt(process.env.SCRAPER_MAX_PAGES) || 8,
        DELAY_MS: parseInt(process.env.SCRAPER_DELAY_MS) || 1000,
        MAX_CHARS: parseInt(process.env.KNOWLEDGE_MAX_CHARS) || 8000,
        USE_PUPPETEER: process.env.SCRAPER_USE_PUPPETEER !== 'false',
        RAW_TEXT_MAX: 15000,
        MIN_CONTENT_LENGTH: 400,
        TIMEOUTS: { AXIOS: 5000, PUPPETEER: 25000 },
        DEDUP_THRESHOLD: 0.85,
        LINK_LIMIT: 10,
        NODE_ENV: process.env.NODE_ENV
    }
}

export default config;