// profileService.js
const calculateProfileMatchScore = (profile, criteria) => {
  let score = 0;
  const weights = {
    designation: 0.4,
    location: 0.3,
    company: 0.3
  };

  // Designation match (using partial string matching)
  if (profile.designation.toLowerCase().includes(criteria.designation.toLowerCase())) {
    score += weights.designation;
  }

  // Location match (exact match with bonus for nearby locations)
  if (profile.location.toLowerCase() === criteria.location.toLowerCase()) {
    score += weights.location;
  } else if (profile.location.toLowerCase().includes(criteria.location.toLowerCase())) {
    score += weights.location * 0.5;
  }

  // Company match
  if (profile.company.toLowerCase() === criteria.company.toLowerCase()) {
    score += weights.company;
  }

  // Experience match (if provided)
  if (criteria.experience && profile.experience) {
    const experienceDiff = Math.abs(profile.experience - criteria.experience);
    if (experienceDiff <= 2) {
      score += 0.1 * (1 - experienceDiff/2);
    }
  }

  return Math.round(score * 100);
};

exports.getRelevantProfiles = async ({ designation, location, company, experience, page = 1, limit = 10 }) => {
  try {
    // Fetch profiles from LinkedIn using the crawler
    const crawler = new LinkedInCrawler({ headless: true });
    await crawler.initialize();
    
    // Search for profiles based on criteria
    const searchQuery = `${designation} ${company} ${location}`;
    const rawProfiles = await crawler.searchProfiles(searchQuery, limit * 2); // Fetch extra to allow for filtering
    
    // Calculate match scores and filter profiles
    const scoredProfiles = rawProfiles.map(profile => ({
      ...profile,
      matchScore: calculateProfileMatchScore(profile, { designation, location, company, experience })
    }));
    
    // Sort by match score and paginate
    const sortedProfiles = scoredProfiles
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice((page - 1) * limit, page * limit);
    
    return sortedProfiles;
  } catch (error) {
    console.error('Error in getRelevantProfiles:', error);
    throw error;
  }
};