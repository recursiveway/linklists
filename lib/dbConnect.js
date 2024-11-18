
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env');
}

// The global object is available in Node.js runtime environment
// It provides a global namespace where we can store variables
// that persist across module imports
let cached = global.mongoose;

if (!cached) {
  // If no cached connection exists in global namespace,
  // initialize it with empty connection and promise
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // Return existing connection if available
  if (cached.conn) {
    console.log('Using cached connection');
    return cached.conn;
  }

  // Create new connection promise if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Await the connection
    cached.conn = await cached.promise;
  } catch (e) {
    // Clear promise on error
    console.error('Error connecting to database:', e);
    cached.promise = null;
    throw e;
  }

  console.log('Using new connection');
  return cached.conn;
}

export default dbConnect;