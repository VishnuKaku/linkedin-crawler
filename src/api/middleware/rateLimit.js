const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Default rate limit values
const windowMs = process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000; // 15 minutes
const maxRequests = process.env.RATE_LIMIT_MAX || 100; // 100 requests per window
const errorMessage = process.env.RATE_LIMIT_MESSAGE || 'Too many requests from this IP, please try again after 15 minutes';

// Rate limit middleware
const limiter = rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    message: errorMessage,
    handler: (req, res) => {
        console.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests',
            message: errorMessage
        });
    },
});

module.exports = limiter;
