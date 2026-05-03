import mongoose from 'mongoose';
import User from '../models/user.model.js';
import Business from '../models/business.model.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Seed a Professional Tier User and Business for testing.
 */
const seedProUser = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is not defined in environment variables");
        }

        // 1. Connect to Database
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("🚀 Connected to MongoDB Atlas");

        // 2. Clean up existing test data (Atomic cleanup)
        const testEmail = 'pro@test.com';
        const existingUser = await User.findOne({ email: testEmail });
        
        if (existingUser) {
            await Business.deleteOne({ owner: existingUser._id });
            await User.deleteOne({ _id: existingUser._id });
            console.log("🧹 Cleaned up existing test user and business");
        }

        // 3. Create PRO User
        // Note: Password hashing is handled by the User model's pre-save hook
        const user = await User.create({
            name: 'Pro Tester',
            email: testEmail,
            password: 'password123',
            role: 'owner'
        });
        console.log("👤 Pro User created");

        // 4. Create PRO Business with auto-generated API Key
        // Note: If your Business model has the auto-gen logic we added earlier, 
        // you don't even need to pass apiKey here.
        const business = await Business.create({
            owner: user._id,
            name: 'Pro Test Business',
            supportEmail: testEmail,
            plan: 'pro',
            conversationLimit: 1000000,
            appearance: {
                themeColor: '#8b5cf6',
                botName: 'Pro AI',
                welcomeMessage: 'Welcome to our premium support!',
                placeholderText: 'Ask us anything...'
            }
        });

        console.log("🏢 Pro Business created");
        console.log("🔑 API Key:", business.apiKey);
        console.log("✨ Seeding completed successfully!");

    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
    } finally {
        // 5. Always close the connection
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed");
        process.exit();
    }
};

seedProUser();