const puppeteer = require('puppeteer-core');
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

class LinkedInCrawler {
  constructor(credentials) {
    this.credentials = credentials;
    this.browser = null;
    this.page = null;
  }

  // Helper function to find Chrome executable path
  findChromeExecutablePath() {
    try {
      const platform = os.platform();
      
      if (platform === 'win32') {
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          path.join(os.homedir(), 'AppData\\Local\\Google\\Chrome\\Application\\chrome.exe')
        ];
        
        for (const path of possiblePaths) {
          try {
            if (require('fs').existsSync(path)) {
              return path;
            }
          } catch (e) {
            continue;
          }
        }
      } else if (platform === 'darwin') {
        return '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
      } else if (platform === 'linux') {
        try {
          execSync('which google-chrome', { stdio: 'ignore' });
          return 'google-chrome';
        } catch {
          try {
            execSync('which chromium', { stdio: 'ignore' });
            return 'chromium';
          } catch {
            // Chrome not found
          }
        }
      }
      
      throw new Error('Could not find Chrome installation. Please install Google Chrome.');
    } catch (error) {
      throw new Error(`Failed to find Chrome executable: ${error.message}`);
    }
  }

  async initialize() {
    try {
      const executablePath = this.findChromeExecutablePath();
      console.log(`Using Chrome at: ${executablePath}`);
      
      this.browser = await puppeteer.launch({
        headless: false,
        executablePath,
        defaultViewport: { width: 1200, height: 800 }
      });
      
      this.page = await this.browser.newPage();
      
      // Add error handling for navigation timeouts
      this.page.setDefaultNavigationTimeout(30000);
      
      // Wait longer for network to be idle
      await this.page.setDefaultTimeout(30000);
    } catch (error) {
      console.error('Failed to initialize:', error);
      throw error;
    }
  }

  async login() {
    try {
      await this.page.goto('https://www.linkedin.com/login', {
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      // Wait for login form and fill credentials
      await this.page.waitForSelector('#username');
      await this.page.type('#username', this.credentials.username);
      await this.page.type('#password', this.credentials.password);
      
      // Click login and wait for navigation
      await Promise.all([
        this.page.click('.login__form_action_container button'),
        this.page.waitForNavigation({ waitUntil: 'networkidle0' })
      ]);
      
      // Verify login success
      await this.page.waitForSelector('.global-nav');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async crawlJobs(searchQuery) {
    try {
      const encodedQuery = encodeURIComponent(searchQuery);
      const url = `https://www.linkedin.com/jobs/search/?keywords=${encodedQuery}`;
      
      // Navigate with proper waiting
      await this.page.goto(url, {
        waitUntil: ['networkidle0', 'domcontentloaded']
      });

      // Wait for job listings to load
      await this.page.waitForSelector('.jobs-search__results-list');
      
      // Extract job data with retry mechanism
      const jobs = await this._extractJobsWithRetry();
      
      return jobs;
    } catch (error) {
      console.error('Failed to crawl jobs:', error);
      throw error;
    }
  }

  async _extractJobsWithRetry(maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Use evaluateHandle to maintain context
        const jobsHandle = await this.page.evaluateHandle(() => {
          const jobs = [];
          const listings = document.querySelectorAll('.jobs-search__results-list > li');
          
          listings.forEach(listing => {
            const titleElement = listing.querySelector('.job-card-list__title');
            const companyElement = listing.querySelector('.job-card-container__company-name');
            const locationElement = listing.querySelector('.job-card-container__metadata-item');
            
            if (titleElement && companyElement) {
              jobs.push({
                title: titleElement.innerText.trim(),
                company: companyElement.innerText.trim(),
                location: locationElement ? locationElement.innerText.trim() : 'Not specified',
                link: titleElement.href
              });
            }
          });
          
          return jobs;
        });

        // Convert handle to regular object
        const jobs = await jobsHandle.jsonValue();
        await jobsHandle.dispose();
        
        return jobs;
      } catch (error) {
        if (attempt === maxRetries) throw error;
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Refresh the page
        await this.page.reload({ waitUntil: ['networkidle0', 'domcontentloaded'] });
      }
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Usage example
async function main() {
  const crawler = new LinkedInCrawler({
    username: process.env.LINKEDIN_USERNAME,
    password: process.env.LINKEDIN_PASSWORD
  });

  try {
    console.log('Initializing crawler...');
    await crawler.initialize();
    
    console.log('Logging in...');
    await crawler.login();
    
    console.log('Crawling jobs...');
    const jobs = await crawler.crawlJobs('Software Engineer');
    console.log(`Found ${jobs.length} jobs`);
    console.log(jobs);
  } catch (error) {
    console.error('Crawler failed:', error);
  } finally {
    await crawler.close();
  }
}

module.exports = LinkedInCrawler;