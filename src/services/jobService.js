// jobService.js
const calculateJobMatchScore = (job, criteria) => {
  let score = 0;
  const weights = {
    designation: 0.3,
    experience: 0.2,
    location: 0.2,
    jobFunction: 0.15,
    preferences: 0.15
  };

  // Designation match
  if (job.title.toLowerCase().includes(criteria.designation.toLowerCase())) {
    score += weights.designation;
  }

  // Experience match
  if (criteria.experience && job.experienceRequired) {
    const experienceDiff = Math.abs(job.experienceRequired - criteria.experience);
    if (experienceDiff <= 2) {
      score += weights.experience * (1 - experienceDiff/2);
    }
  }

  // Location match
  if (job.location.toLowerCase().includes(criteria.location.toLowerCase())) {
    score += weights.location;
  }

  // Job function match
  if (criteria.jobFunction && job.jobFunction?.toLowerCase().includes(criteria.jobFunction.toLowerCase())) {
    score += weights.jobFunction;
  }

  // Preferences match (keyword based)
  if (criteria.preferences) {
    const preferenceKeywords = criteria.preferences.toLowerCase().split(',').map(p => p.trim());
    const jobDescription = job.description?.toLowerCase() || '';
    const matchedPreferences = preferenceKeywords.filter(keyword => 
      jobDescription.includes(keyword)
    );
    score += weights.preferences * (matchedPreferences.length / preferenceKeywords.length);
  }

  return Math.round(score * 100);
};

exports.getRelevantJobs = async ({ experience, jobFunction, designation, location, preferences, page = 1, limit = 20 }) => {
  try {
    // Fetch jobs using the crawler
    const crawler = new LinkedInCrawler({ headless: true });
    await crawler.initialize();
    
    const searchQuery = `${designation} ${location}`;
    const rawJobs = await crawler.crawlLinkedInJobs(searchQuery, limit * 2); // Fetch extra to allow for filtering
    
    // Calculate match scores
    const scoredJobs = rawJobs.map(job => ({
      ...job,
      matchScore: calculateJobMatchScore(job, {
        experience,
        jobFunction,
        designation,
        location,
        preferences
      })
    }));
    
    // Sort by match score and paginate
    const sortedJobs = scoredJobs
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice((page - 1) * limit, page * limit);
    
    return sortedJobs;
  } catch (error) {
    console.error('Error in getRelevantJobs:', error);
    throw error;
  }
};