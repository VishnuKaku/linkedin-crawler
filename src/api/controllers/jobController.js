// src/api/controllers/jobController.js
const Job = require('../../models/Job');
const Joi = require('joi');

const jobQuerySchema = Joi.object({
    experience: Joi.number().integer().min(0).optional(),
    jobFunction: Joi.string().optional(),
    designation: Joi.string().required(),
    location: Joi.string().required(),
    preferences: Joi.string().optional(),
    limit: Joi.number().integer().optional().default(10)
});

exports.getJobs = async (req, res) => {
    try {
        const { error, value } = jobQuerySchema.validate(req.query);
        
        if (error) {
            return res.status(400).json({
                success: false,
                error: 'Validation error',
                details: error.details.map(d => d.message)
            });
        }

        const { designation, location, experience, jobFunction, limit } = value;

        const query = {
            designation: new RegExp(designation, 'i'),
            location: new RegExp(location, 'i')
        };

        if (experience) {
            query.requiredExperience = {
                $gte: experience - 2,
                $lte: experience + 2
            };
        }

        if (jobFunction) {
            query.jobFunction = new RegExp(jobFunction, 'i');
        }

        const jobs = await Job.find(query).limit(limit);

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({ 
                message: 'No jobs found for the given criteria.' 
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                jobs: jobs,
                count: jobs.length
            }
        });

    } catch (error) {
        console.error('Error in getJobs:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};