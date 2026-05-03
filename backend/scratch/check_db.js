require('dotenv').config();
const mongoose = require('mongoose');
const Business = require('../models/Business');
const User = require('../models/User');

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- User: ${u.email} (ID: ${u._id}, Role: ${u.role}, OwnerId: ${u.ownerId || 'N/A'})`);
        });

        console.log('\n--- Businesses ---\n');

        const businesses = await Business.find({});
        console.log(`Found ${businesses.length} businesses:`);
        businesses.forEach(b => {
            console.log(`- Business: ${b.name}`);
            console.log(`  OwnerID: ${b.owner || 'N/A'}`);
            console.log(`  API Key: ${b.apiKey || 'MISSING'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkDB();
