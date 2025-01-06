// src/utils/retry.js

/**
 * Retry a given function a specific number of times.
 * @param {Function} fn The function to retry.
 * @param {number} retries Number of times to retry.
 * @param {number} delay Delay between retries in milliseconds.
 * @returns {Promise} Resolves with the result of the function if successful, or throws an error after retries are exhausted.
 */
async function retry(fn, retries = 3, delay = 1000) {
    let lastError;
  
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();  // Try to execute the function
      } catch (error) {
        lastError = error;
        console.error(`Retry ${i + 1} failed:`, error.message);
        if (i < retries - 1) {
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));  // Wait before retrying
        }
      }
    }
  
    // If all retries fail, throw the last error
    throw lastError;
  }
  
  module.exports = { retry };
  