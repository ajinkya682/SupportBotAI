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
            family: 4 // Force IPv4 to avoid some Render/Atlas resolution issues
        });
        console.log(`🚀 MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        // If we can't connect, we should exit so Render knows to restart the container
        process.exit(1);
    }
};

export default connectDB;