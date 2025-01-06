const { getRelevantJobs } = require('../services/jobService');
const Joi = require('joi');

// Define a schema for input validation
const jobQuerySchema = Joi.object({
  experience: Joi.number().integer().min(0).optional(),
  jobFunction: Joi.string().optional(),
  designation: Joi.string().required(),
  location: Joi.string().required(),
  preferences: Joi.string().optional(),
  page: Joi.number().integer().optional(),  // Add pagination
  limit: Joi.number().integer().optional(), // Add limit
});

const getJobs = async (req, res) => {
  try {
    const { error, value } = jobQuerySchema.validate(req.query, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map((detail) => detail.message),
      });
    }

    // Destructure the validated parameters
    const { experience, jobFunction, designation, location, preferences, page, limit } = value;

    // Fetch jobs using validated query parameters
    const jobs = await getRelevantJobs({
      experience,
      jobFunction,
      designation,
      location,
      preferences,
      page,
      limit,
    });

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'No jobs found for the given criteria.' });
    }

    // Return jobs with scores and pagination details
    return res.status(200).json({
      message: 'Jobs fetched successfully.',
      data: jobs,
      page,
      limit,
    });
  } catch (err) {
    console.error('Error fetching jobs:', err);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred while processing your request.',
    });
  }
};

module.exports = { getJobs };
