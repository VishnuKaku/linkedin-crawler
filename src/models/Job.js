// src/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    designation: {
        type: String,
        required: true
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    requiredExperience: {
        type: Number
    },
    jobFunction: {
        type: String
    },
    requiredSkills: [{
        type: String
    }],
    description: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);