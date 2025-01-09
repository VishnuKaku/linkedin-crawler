// src/api/routes/jobs.js
const express = require('express');
const jobController = require('../controllers/jobController');

const router = express.Router();

router.get('/', jobController.getJobs);

module.exports = router;