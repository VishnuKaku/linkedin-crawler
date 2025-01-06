const express = require('express');
const { getRelevantProfiles } = require('../../services/profileService');
const Joi = require('joi');

const router = express.Router();

// Define a schema for input validation
const profileQuerySchema = Joi.object({
  designation: Joi.string().required(),
  location: Joi.string().required(),
  company: Joi.string().required(),
  experience: Joi.number().integer().optional(),  // Optional experience field
  page: Joi.number().integer().optional().default(1),  // Default page 1
  limit: Joi.number().integer().optional().default(20),  // Default limit 20
});

const getProfiles = async (req, res) => {
  try {
    // Validate the request query parameters
    const { error, value } = profileQuerySchema.validate(req.query, { abortEarly: false });

    // Handle validation errors
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    // Safe destructuring after validation
    const { designation, location, company, experience, page, limit } = value;

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

// Route to fetch profiles with query parameters
router.get('/', getProfiles);

module.exports = router;
