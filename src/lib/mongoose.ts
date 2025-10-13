import mongoose from "mongoose";
import { connectDBMock } from "./mock-db";

const MONGODB_URI = process.env.MONGODB_URI;
const isMockMode = process.env.MOCK_DB === "true";

let cached = (global as any).mongoose;

// 🧩 Choose which connection function to export
let connectToDatabase: () => Promise<any>;

// 🧪 Mock Mode (no Mongo)
if (isMockMode) {
  console.log("🧪 Mock database mode enabled (no MongoDB connection).");
  connectToDatabase = async () => connectDBMock();
} else {
  if (!MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is not defined");
  }

  if (!cached) {
    cached = (global as any).mongoose = { conn: null, promise: null };
  }

  connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
      cached.promise = mongoose.connect(MONGODB_URI!, {
        bufferCommands: false,
      });
    }

    cached.conn = await cached.promise;
    return cached.conn;
  };
}

export default connectToDatabase;