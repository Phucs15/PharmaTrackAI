import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;
  const conn = await mongoose.connect(uri);
  console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
