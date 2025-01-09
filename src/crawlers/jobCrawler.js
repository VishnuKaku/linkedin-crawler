const BaseCrawler = require('./baseCrawler');

class JobCrawler extends BaseCrawler {
  constructor(options = {}) {
    super(options);
    this.baseUrl = 'https://www.linkedin.com/jobs/search';
  }

  async crawlJobs(designation, location) {
    try {
      await this.initialize();
      
      const searchUrl = `${this.baseUrl}?keywords=${encodeURIComponent(designation)}&location=${encodeURIComponent(location)}`;
      await this.navigateToPage(searchUrl, '.jobs-search-results-list');
      
      const jobs = await this.extractJobListings();
      
      // Store jobs in database
      await this.saveJobs(jobs);
      
      await this.close();
      return jobs;
    } catch (error) {
      console.error('Error crawling jobs:', error);
      await this.close();
      throw error;
    }
  }

  async extractJobListings() {
    return await this.page.evaluate(() => {
      const jobCards = document.querySelectorAll('.job-card-container');
      return Array.from(jobCards).map(card => ({
        title: card.querySelector('.job-card-list__title')?.innerText?.trim() || '',
        company: card.querySelector('.job-card-container__company-name')?.innerText?.trim() || '',
        location: card.querySelector('.job-card-container__metadata-item')?.innerText?.trim() || '',
        url: card.querySelector('.job-card-list__title')?.href || '',
        datePosted: new Date().toISOString()
      }));
    });
  }

  async saveJobs(jobs) {
    const Job = require('../models/Job');
    for (const jobData of jobs) {
      try {
        // Get full job details
        await this.navigateToPage(jobData.url, '.job-view-layout');
        const fullJobDetails = await this.extractJobDetails();
        
        // Merge and save
        await Job.findOneAndUpdate(
          { url: jobData.url },
          { ...jobData, ...fullJobDetails },
          { upsert: true, new: true }
        );
      } catch (error) {
        console.error(`Error saving job ${jobData.url}:`, error);
      }
    }
  }

  async extractJobDetails() {
    return await this.page.evaluate(() => ({
      description: document.querySelector('.job-description')?.innerText?.trim() || '',
      skillsRequired: Array.from(document.querySelectorAll('.job-requirements .skill-tag'))
        .map(skill => skill.innerText.trim()),
      experienceRequired: document.querySelector('.experience-requirement')?.innerText?.trim() || '',
      jobFunction: document.querySelector('.job-function')?.innerText?.trim() || ''
    }));
  }
}

module.exports = JobCrawler;  // Export the class, not an instance