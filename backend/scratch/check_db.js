const mongoose = require('mongoose');
const Business = require('../models/Business');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGODB_URI);
    const ownerId = '69f9eb8c893ad4971bc7003c';
    const business = await Business.findOne({ owner: ownerId });
    console.log('Business found:', business);
    process.exit(0);
}

check();
