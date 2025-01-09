require('dotenv').config();
const LinkedInCrawler = require('../utils/crawler');

async function main() {
  const crawler = new LinkedInCrawler({
    username: process.env.LINKEDIN_EMAIL,    // Changed from direct email/password passing
    password: process.env.LINKEDIN_PASSWORD  // to match the constructor expectations
  });

  try {
    console.log('Initializing crawler...');
    await crawler.initialize();

    // Validate environment variables early
    if (!process.env.LINKEDIN_EMAIL || !process.env.LINKEDIN_PASSWORD) {
      throw new Error('LinkedIn credentials (LINKEDIN_EMAIL, LINKEDIN_PASSWORD) are not set in environment variables.');
    }

    console.log('LinkedIn credentials found, attempting login...');
    await crawler.login();  // No need to pass credentials here as they're already in the constructor
    console.log('Login successful!');

    // Start crawling jobs
    console.log('Starting job crawl...');
    const jobQuery = 'Software Engineer';
    const jobs = await crawler.crawlJobs(jobQuery);  // Changed from crawlLinkedInJobs to crawlJobs

    if (jobs.length > 0) {
      console.log(`Successfully crawled ${jobs.length} jobs`);
      console.log(jobs);
    } else {
      console.log('No jobs found.');
    }

  } catch (error) {
    console.error('Crawler failed:', error);
  } finally {
    try {
      console.log('Closing crawler...');
      await crawler.close();
    } catch (closeError) {
      console.error('Failed to close the crawler:', closeError);
    }
  }
}

main().catch(console.error);