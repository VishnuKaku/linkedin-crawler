const mongoose = require('mongoose');
const dotenv = require('dotenv');
const retry = require('async-retry');

// Load environment variables
dotenv.config();

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;

  // Check if the MONGO_URI is provided in the environment variables
  if (!mongoURI) {
    console.error('Mongo URI not found in environment variables');
    process.exit(1);
  }

  try {
    // Retry mechanism for MongoDB connection
    await retry(async () => {
      await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 5000,   // Timeout for server selection
        socketTimeoutMS: 45000,           // Timeout for socket inactivity
        family: 4,                        // Use IPv4
        maxPoolSize: 10,                  // Maximum pool size for connections
      });
      console.log('Connected to MongoDB');
    }, {
      retries: 5,  // Retry up to 5 times before failing
      minTimeout: 1000,  // Wait 1 second between retries
      onRetry: (err, attempt) => {
        console.warn(`Retrying MongoDB connection, attempt ${attempt}...`);
      },
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);  // Exit process after 5 failed attempts
  }

  // Monitor Mongoose connection events
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to DB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`Mongoose connection error: ${err}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose disconnected');
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to app termination');
    process.exit(0);
  });

  // Handle SIGTERM for environments like Kubernetes
  process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    console.log('Mongoose connection closed due to SIGTERM');
    process.exit(0);
  });
};

module.exports = connectDB;
