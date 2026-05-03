import dotenv from 'dotenv';
dotenv.config();

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

const config = {
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_EXPIRES_IN: process.env.JWT_SECRET_EXPIRES_IN || '30d',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REFRESH_TOKEN: process.env.REFRESH_TOKEN,
}

export default config;