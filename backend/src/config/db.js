import mongoose from 'mongoose';
import config from './config.js';


const connectDB = async () => {
  const conn = await mongoose.connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
    
    maxPoolSize: 50,         
    minPoolSize: 10,          
    maxIdleTimeMS: 45000,     
    waitQueueTimeoutMS: 10000, 
    
    retryWrites: true,
    w: 'majority',
  });

  console.log(`✅ MongoDB Connected with pool size: 50`);
  return conn;
};

export default connectDB;