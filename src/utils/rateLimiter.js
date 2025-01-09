// src/utils/rateLimiter.js
const RateLimit = {
    async waitForNextRequest() {
      const minDelay = 2000;
      const maxDelay = 5000;
      const delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  };
  
  module.exports = RateLimit;