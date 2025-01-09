// src/api/controllers/profileController.js
const Profile = require('../../models/Profile');
const Joi = require('joi');

const profileQuerySchema = Joi.object({
    designation: Joi.string().required(),
    location: Joi.string().required(),
    company: Joi.string().required(),
    skillsRequired: Joi.array().items(Joi.string()).optional()
});

exports.getProfiles = async (req, res) => {
    try {
        const { error, value } = profileQuerySchema.validate(req.query);
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const { designation, location, company, skillsRequired } = value;

        const profiles = await Profile.find({
            designation: new RegExp(designation, 'i'),
            location: new RegExp(location, 'i'),
            company: new RegExp(company, 'i')
        }).limit(10);

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