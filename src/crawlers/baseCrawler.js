// src/crawlers/baseCrawler.js
const puppeteer = require('puppeteer');
const { getRandomUserAgent } = require('../utils/userAgentRotator');
const { retry } = require('../utils/retry');

class BaseCrawler {
  constructor(options = {}) {
    this.options = {
      headless: true,
      maxRetries: 3,
      waitTime: 2000,
      ...options
    };
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: this.options.headless,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });
    this.page = await this.browser.newPage();
    await this.page.setUserAgent(getRandomUserAgent());
    await this.setupPageInterceptors();
  }

  async setupPageInterceptors() {
    await this.page.setRequestInterception(true);
    this.page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });
  }

  async navigateToPage(url, waitForSelector) {
    return retry(async () => {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      if (waitForSelector) {
        await this.page.waitForSelector(waitForSelector);
      }
    }, this.options.maxRetries);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

module.exports = BaseCrawler;