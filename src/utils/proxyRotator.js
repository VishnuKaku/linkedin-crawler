// src/utils/proxyRotator.js
class ProxyRotator {
  constructor() {
    this.proxies = [
      // Add your proxy list here
      'http://proxy1.example.com:8080',
      'http://proxy2.example.com:8080',
      'http://proxy3.example.com:8080',
      'http://proxy4.example.com:8080',
      'http://proxy5.example.com:8080'
    ];
    this.currentIndex = 0;
  }

  /**
   * Get the next proxy in the list.
   * @returns {string} The next proxy URL.
   */
  getNext() {
    if (this.proxies.length === 0) {
      throw new Error('Proxy list is empty');
    }
    const proxy = this.proxies[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.proxies.length;
    return proxy;
  }
}

module.exports = new ProxyRotator();
