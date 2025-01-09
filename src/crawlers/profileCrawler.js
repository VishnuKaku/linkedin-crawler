// src/api/controllers/profileController.js
const { getRelevantProfiles } = require('../../services/profileService');
const Joi = require('joi');

const profileQuerySchema = Joi.object({
    designation: Joi.string().required(),
    location: Joi.string().required(),
    company: Joi.string().required(),
    skillsRequired: Joi.array().items(Joi.string()).optional()
});

const getProfiles = async (req, res) => {
    try {
        const { error, value } = profileQuerySchema.validate(req.query, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const { designation, location, company, skillsRequired } = value;

        const profiles = await getRelevantProfiles({
            designation,
            location,
            company,
            skills: skillsRequired
        });

        if (!profiles || profiles.length === 0) {
            return res.status(404).json({ 
                message: 'No profiles found for the given criteria.' 
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                profiles: profiles,
                count: profiles.length
            }
        });

    } catch (error) {
        console.error('Error in getProfiles:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

module.exports = {
    getProfiles
};