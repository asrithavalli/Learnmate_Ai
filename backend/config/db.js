'use strict';

const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGO_URI from environment.
 * Exits the process on failure so a misconfigured server never
 * silently serves requests without a database.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] MONGO_URI is not set in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log(`[DB] MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
