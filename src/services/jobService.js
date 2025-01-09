// src/services/jobService.js
const Job = require('../models/Job');

const calculateSkillSimilarity = (profileSkills, requiredSkills) => {
    if (!profileSkills || !requiredSkills) return 0;
    const profileSkillSet = new Set(profileSkills.map(s => s.toLowerCase()));
    const requiredSkillSet = new Set(requiredSkills.map(s => s.toLowerCase()));
    const intersection = [...profileSkillSet].filter(skill => requiredSkillSet.has(skill));
    return intersection.length / Math.max(profileSkillSet.size, requiredSkillSet.size);
};

const calculateLocationMatch = (jobLocation, targetLocation) => {
    if (!jobLocation || !targetLocation) return 0;
    jobLocation = jobLocation.toLowerCase();
    targetLocation = targetLocation.toLowerCase();
    
    if (jobLocation === targetLocation) return 1;
    if (jobLocation.includes(targetLocation) || targetLocation.includes(jobLocation)) return 0.8;
    return 0;
};

const calculateJobMatchScore = (job, criteria) => {
    const weights = {
        title: 0.25,
        skills: 0.25,
        location: 0.2,
        experience: 0.2,
        company: 0.1
    };

    let score = 0;
    
    // Title/Designation match
    const titleMatch = job.designation.toLowerCase().includes(criteria.designation.toLowerCase()) ? 1 : 0;
    score += titleMatch * weights.title;
    
    // Skills match
    if (criteria.skills) {
        const skillsMatch = calculateSkillSimilarity(job.requiredSkills, criteria.skills);
        score += skillsMatch * weights.skills;
    }
    
    // Location match
    const locationMatch = calculateLocationMatch(job.location, criteria.location);
    score += locationMatch * weights.location;
    
    // Experience match
    if (criteria.experience && job.requiredExperience) {
        const diff = Math.abs(job.requiredExperience - criteria.experience);
        let experienceMatch = 0.4;
        if (diff === 0) experienceMatch = 1;
        else if (diff <= 2) experienceMatch = 0.8;
        else if (diff <= 4) experienceMatch = 0.6;
        score += experienceMatch * weights.experience;
    }

    return Math.round(score * 100);
};

exports.getRelevantJobs = async ({ designation, location, experience, skills, limit = 10 }) => {
    try {
        const query = {
            $or: [
                { designation: { $regex: designation, $options: 'i' } },
                { location: { $regex: location, $options: 'i' } }
            ]
        };

        if (experience) {
            query.requiredExperience = {
                $gte: experience - 4,
                $lte: experience + 4
            };
        }

        const jobs = await Job.find(query);

        const scoredJobs = jobs.map(job => ({
            ...job.toObject(),
            matchScore: calculateJobMatchScore(job, { designation, location, experience, skills })
        }));

        return scoredJobs
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

    } catch (error) {
        console.error('Error in getRelevantJobs:', error);
        throw error;
    }
};
