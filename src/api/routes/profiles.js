// src/api/routes/profiles.js
const express = require('express');
const profileController = require('../controllers/profileController');

const router = express.Router();

router.get('/', profileController.getProfiles);

module.exports = router;