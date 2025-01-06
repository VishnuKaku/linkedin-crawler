const express = require('express');
const { getJobs } = require('../../controllers/jobController');

const router = express.Router();

// Route to fetch jobs with query parameters
router.get('/', getJobs);  // Already handles the query parameters for filtering

module.exports = router;
