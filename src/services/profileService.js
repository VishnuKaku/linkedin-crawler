// src/services/profileService.js
const Profile = require('../models/Profile');

const calculateSkillSimilarity = (profileSkills, targetSkills) => {
    if (!profileSkills || !targetSkills) return 0;
    const profileSkillSet = new Set(profileSkills.map(s => s.toLowerCase()));
    const targetSkillSet = new Set(targetSkills.map(s => s.toLowerCase()));
    const intersection = [...profileSkillSet].filter(skill => targetSkillSet.has(skill));
    return intersection.length / Math.max(profileSkillSet.size, targetSkillSet.size);
};

const calculateLocationMatch = (profileLocation, targetLocation) => {
    if (!profileLocation || !targetLocation) return 0;
    profileLocation = profileLocation.toLowerCase();
    targetLocation = targetLocation.toLowerCase();
    
    if (profileLocation === targetLocation) return 1;
    if (profileLocation.includes(targetLocation) || targetLocation.includes(profileLocation)) return 0.8;
    return 0;
};

const calculateProfileMatchScore = (profile, criteria) => {
    const weights = {
        designation: 0.3,
        company: 0.25,
        location: 0.25,
        skills: 0.2
    };

    let score = 0;
    
    // Designation match
    const designationMatch = profile.designation.toLowerCase().includes(criteria.designation.toLowerCase()) ? 1 : 0;
    score += designationMatch * weights.designation;
    
    // Company match
    if (criteria.company && profile.company) {
        const companyMatch = profile.company.toLowerCase().includes(criteria.company.toLowerCase()) ? 1 : 0;
        score += companyMatch * weights.company;
    }
    
    // Location match
    const locationMatch = calculateLocationMatch(profile.location, criteria.location);
    score += locationMatch * weights.location;
    
    // Skills match
    if (criteria.skills && profile.skills && profile.skills.length > 0) {
        const skillsMatch = calculateSkillSimilarity(profile.skills, criteria.skills);
        score += skillsMatch * weights.skills;
    }

    return Math.round(score * 100);
};

exports.getRelevantProfiles = async ({ designation, location, company, skills, limit = 10 }) => {
    try {
        const query = {
            $or: [
                { designation: { $regex: designation, $options: 'i' } },
                { location: { $regex: location, $options: 'i' } },
                { company: { $regex: company, $options: 'i' } }
            ]
        };

        const profiles = await Profile.find(query);

        const scoredProfiles = profiles.map(profile => ({
            ...profile.toObject(),
            matchScore: calculateProfileMatchScore(profile, { designation, location, company, skills })
        }));

        return scoredProfiles
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, limit);

    } catch (error) {
        console.error('Error in getRelevantProfiles:', error);
        throw error;
    }
};