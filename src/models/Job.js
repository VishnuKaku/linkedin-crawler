// src/models/Job.js
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  company: {
    type: String,
    required: true,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  skillsRequired: [{
    type: String,
    index: true
  }],
  experienceRequired: {
    type: String
  },
  jobFunction: {
    type: String,
    index: true
  },
  datePosted: {
    type: Date,
    default: Date.now
  },
  url: {
    type: String,
    unique: true
  }
}, { timestamps: true });

// Create text indexes for search
jobSchema.index({
  title: 'text',
  company: 'text',
  description: 'text',
  skillsRequired: 'text'
});

module.exports = mongoose.model('Job', jobSchema);