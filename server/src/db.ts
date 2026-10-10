import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

export async function connectDB(): Promise<void> {
  const customUri = process.env.MONGODB_URI;

  if (customUri) {
    try {
      console.log(`[Database] Attempting connection to MongoDB at: ${customUri}`);
      await mongoose.connect(customUri, { serverSelectionTimeoutMS: 3000 });
      console.log('[Database] Connected to external/local MongoDB successfully.');
      return;
    } catch (err: any) {
      console.warn(`[Database] Failed to connect to ${customUri}. Falling back to in-memory instance.`);
    }
  }

  try {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log(`[Database] In-memory MongoDB started and connected at: ${uri}`);
  } catch (error) {
    console.error('[Database] Failed to initialize in-memory MongoDB:', error);
    throw error;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}
