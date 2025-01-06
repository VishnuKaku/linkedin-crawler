const puppeteer = require('puppeteer');
const { getRandomUserAgent } = require('../utils/userAgentRotator');
const proxyRotator = require('../utils/proxyRotator');
const Job = require('../models/Job');
const { retryCrawl } = require('../utils/retry'); // Custom retry logic

class JobCrawler {
  async crawl() {
    const proxy = proxyRotator.getNext();
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: [`--proxy-server=${proxy}`],
      });
      const page = await browser.newPage();
      
      const userAgent = getRandomUserAgent();
      await page.setUserAgent(userAgent);

      // Retry crawl in case of errors
      await retryCrawl(async () => {
        await page.goto('https://www.linkedin.com/jobs/search/?keywords=software%20engineer', { waitUntil: 'networkidle2' });
        
        // Crawling logic
        const jobs = await page.evaluate(() => {
          return [...document.querySelectorAll('.job-card-container')].map(job => ({
            title: job.querySelector('.job-card-list__title')?.innerText || '',
            company: job.querySelector('.job-card-container__company-name')?.innerText || '',
            location: job.querySelector('.job-card-container__metadata-item')?.innerText || '',
            description: job.querySelector('.job-card-container__description')?.innerText || '',
            url: job.querySelector('a.job-card-container__link')?.href || '',
            postedDate: new Date(job.querySelector('.job-card-container__listed-time')?.innerText || Date.now())
          }));
        });

        // Filter out incomplete job entries
        const filteredJobs = jobs.filter(job => job.title && job.company && job.location && job.url);
        
        // Save to database
        await Job.insertMany(filteredJobs);
        console.log(`Successfully crawled ${filteredJobs.length} jobs.`);
      });

    } catch (error) {
      console.error('Crawling error:', error);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

module.exports = new JobCrawler();
