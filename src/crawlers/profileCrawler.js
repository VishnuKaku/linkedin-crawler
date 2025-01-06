const puppeteer = require('puppeteer');
const { getRandomUserAgent } = require('../utils/userAgentRotator');
const proxyRotator = require('../utils/proxyRotator');
const Profile = require('../models/Profile');
const { retryCrawl } = require('../utils/retry'); // Custom retry logic

async function profileCrawler(url) {
  const proxy = proxyRotator.getNext();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [`--proxy-server=${proxy}`]
    });
    const page = await browser.newPage();

    const userAgent = getRandomUserAgent();
    await page.setUserAgent(userAgent);

    // Retry crawl in case of errors
    await retryCrawl(async () => {
      await page.goto(url, { waitUntil: 'networkidle2' });
      await page.waitForSelector('.pv-top-card');

      const profileData = await page.evaluate(() => {
        const name = document.querySelector('.pv-top-card--list li')?.innerText || '';
        const headline = document.querySelector('.pv-top-card--headline')?.innerText || '';
        const location = document.querySelector('.pv-top-card--list-bullet li')?.innerText || '';
        const summary = document.querySelector('.pv-about__summary-text')?.innerText || '';
        const currentCompany = document.querySelector('.pv-entity__secondary-title')?.innerText || '';
        const skills = [...document.querySelectorAll('.pv-skill-category-entity__name-text')].map(skill => skill.innerText);

        return { name, title: headline, location, summary, currentCompany, skills };
      });

      // Save to database
      const newProfile = new Profile(profileData);
      await newProfile.save();
      console.log('Profile saved:', profileData);
    });
  } catch (error) {
    console.error('Error crawling profile:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

module.exports = profileCrawler;
