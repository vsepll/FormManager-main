import { MongoClient, ServerApiVersion } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
};

export async function connectToDatabase() {
  try {
    const client = new MongoClient(uri, options);
    await client.connect();
    const db = client.db();
    return { db, client };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}