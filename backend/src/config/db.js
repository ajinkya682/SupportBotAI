import mongoose from 'mongoose';
import config from './config.js';


const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            maxPoolSize: 50,
            minPoolSize: 10,
            connectTimeoutMS: 30000,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // Don't exit process in production to allow Render to keep trying
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
};

export default connectDB;