// src/utils/cache.js
const Redis = require('redis');

class Cache {
  constructor() {
    this.client = Redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    this.client.on('error', (err) => console.error('Redis Client Error', err));
  }

  async get(key) {
    return await this.client.get(key);
  }

  async set(key, value, expireSeconds = 3600) {
    await this.client.set(key, value, {
      EX: expireSeconds
    });
  }
}

module.exports = new Cache();