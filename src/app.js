const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const jobRoutes = require('./api/routes/jobs');
const profileRoutes = require('./api/routes/profiles');
const connectDB = require('./config/database');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create Express app
const app = express();

// Set up logging (morgan)
app.use(morgan('combined'));

// Security with Helmet
app.use(helmet());

// Debug logging for MongoDB URI
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('Environment:', process.env.NODE_ENV);

// MongoDB connection retry
async function connectDBWithRetry() {
  const retries = 5;
  let attempt = 0;

  while (attempt < retries) {
    try {
      await connectDB();
      console.log('MongoDB connected');
      return;
    } catch (err) {
      attempt++;
      console.error(`Database connection attempt ${attempt} failed. Retrying...`);
      if (attempt >= retries) {
        console.error('Database connection failed after multiple attempts.');
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, 5000));  // Wait 5 seconds before retrying
    }
  }
}

connectDBWithRetry();

// Middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

app.use(limiter);
app.use(express.json());

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/profiles', profileRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Perform health checks (e.g., check DB connection)
    await connectDB();  // You could also check if DB is healthy here
    res.status(200).json({ status: 'OK', timestamp: new Date(), db: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'FAIL', message: 'Database not connected' });
  }
});

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = app;
