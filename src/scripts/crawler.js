require('dotenv').config();
const LinkedInCrawler = require('../utils/crawler');

async function main() {
  const crawler = new LinkedInCrawler({
    headless: false,  // Set this to true when you're done debugging
    waitTime: 3000,
    retries: 3
  });

  try {
    console.log('Initializing crawler...');
    await crawler.initialize();

    // Validate aenvironment variables early
    const email = process.env.LINKEDIN_EMAIL;
    const password = process.env.LINKEDIN_PASSWORD;

    if (!email || !password) {
      throw new Error('LinkedIn credentials (LINKEDIN_EMAIL, LINKEDIN_PASSWORD) are not set in environment variables.');
    }

    console.log('LinkedIn credentials found, attempting login...');

    // Login with retries
    let loggedIn = false;
    let loginAttempts = 0;

    while (!loggedIn && loginAttempts < crawler.retries) {
      try {
        console.log(`Attempting login (Attempt ${loginAttempts + 1})...`);
        await crawler.login(email, password);
        loggedIn = true;
        console.log('Login successful!');
      } catch (loginError) {
        loginAttempts++;
        console.error('Login attempt failed:', loginError);
        if (loginAttempts >= crawler.retries) {
          throw new Error('Max login retries reached.');
        }
        console.log(`Retrying login... (Attempt ${loginAttempts + 1})`);
      }
    }

    // Start crawling jobs
    console.log('Starting job crawl...');
    const jobQuery = 'Software Engineer';  // Dynamic input is possible
    const jobLimit = 20;  // Can be dynamic based on user input or config

    // Fetch jobs with improved error handling and more logging
    const jobs = await crawler.crawlLinkedInJobs(jobQuery, jobLimit);

    if (jobs.length > 0) {
      console.log(`Successfully crawled ${jobs.length} jobs`);
      // Process the jobs here, like saving them to a database or file
    } else {
      console.log('No jobs found.');
    }

  } catch (error) {
    console.error('Crawler failed:', error);
  } finally {
    // Ensure crawler is properly closed
    try {
      console.log('Closing crawler...');
      await crawler.close();
    } catch (closeError) {
      console.error('Failed to close the crawler:', closeError);
    }
  }
}

main().catch(console.error);
