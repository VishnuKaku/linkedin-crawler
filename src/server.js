const app = require('./app');  // Import the app instance
const dotenv = require('dotenv');
const http = require('http');

dotenv.config();

// Get the port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Create an HTTP server
const server = http.createServer(app);

// Handle server errors
server.on('error', (err) => {
  console.error('Error starting the server:', err);
  process.exit(1);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  // Force close server after 5 seconds
  setTimeout(() => {
    console.error('Forcing server shutdown');
    process.exit(1);
  }, 5000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  shutdown();
});
