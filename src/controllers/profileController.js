const { getRelevantProfiles } = require('../services/profileService');
const Joi = require('joi');

// Define a schema for input validation
const profileQuerySchema = Joi.object({
  designation: Joi.string().required(),
  location: Joi.string().required(),
  company: Joi.string().required(),
  experience: Joi.number().integer().optional(), // Optional experience field
  page: Joi.number().integer().optional(),  // Add pagination
  limit: Joi.number().integer().optional(), // Limit the number of results
});

const getProfiles = async (req, res) => {
  try {
    // Validate the request query parameters
    const { error, value } = profileQuerySchema.validate(req.query, { abortEarly: false });

    // Handle validation errors
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),  // Detailed validation messages
      });
    }

    // Safe destructuring after validation
    const { designation, location, company, experience, page = 1, limit = 20 } = value;

    // Fetch profiles using validated query parameters
    const profiles = await getRelevantProfiles({
      designation,
      location,
      company,
      experience,
      page,
      limit,
    });

    // Handle case where no profiles are found
    if (!profiles || profiles.length === 0) {
      return res.status(404).json({ message: 'No profiles found for the given criteria.' });
    }

    // Return profiles with match scores and pagination details
    return res.status(200).json({
      message: 'Profiles fetched successfully.',
      data: profiles,
      page,
      limit,
    });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request.',
    });
  }
};

module.exports = { getProfiles };
