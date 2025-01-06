const puppeteer = require('puppeteer');
const proxyRotator = require('./src/utils/proxyRotator');  // Import ProxyRotator
const { retry } = require('./src/utils/retry');           // Import retry utility

async function launchBrowser() {
  const browserOptions = {
    headless: true,  // Set to false if you want to see the browser actions
    args: [
      `--proxy-server=${proxyRotator.getNext()}`,  // Rotate proxy for each launch
      '--no-sandbox',
      '--disable-setuid-sandbox',
    ],
    defaultViewport: null,
    slowMo: 100, // Optional: slow down actions for better debugging
  };

  try {
    const browser = await puppeteer.launch(browserOptions);
    const page = await browser.newPage();

    // Wrap page navigation in retry logic
    await retry(() => page.goto('https://example.com'), 3, 2000);  // Try 3 times, 2 seconds delay

    // You can also wrap other actions in retry logic, for example:
    await retry(() => page.waitForSelector('h1', { timeout: 5000 }), 3, 2000);  // Wait for selector, retry 3 times

    // Perform your actions
    console.log('Page title:', await page.title());

    await browser.close();
  } catch (err) {
    console.error('Error during Puppeteer operation:', err);
  }
}

launchBrowser();
