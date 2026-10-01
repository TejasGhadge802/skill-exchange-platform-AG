const mongoose = require('mongoose');
const config = require('./env');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[MongoDB Warning] Could not connect to MongoDB at ${config.mongodbUri}. Running in degraded state. Error: ${error.message}`);
    return null;
  }
};

module.exports = connectDB;

