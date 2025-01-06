const { getRelevantJobs } = require('../services/jobService');

const getJobs = async (req, res) => {
  const { experience, jobFunction, designation, location, preferences } = req.query;
  const jobs = await getRelevantJobs({ experience, jobFunction, designation, location, preferences });
  res.json(jobs);
};

module.exports = { getJobs };