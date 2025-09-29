import mongoose from 'mongoose';

export async function mongoConnect() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/evote';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}
