import mongoose from 'mongoose';
import config from './config.js';


const connectDB = async () => {

  const conn = await mongoose.connect(config.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  });

  console.log(`MongoDB Connected`);
  return conn;
};

export default connectDB;