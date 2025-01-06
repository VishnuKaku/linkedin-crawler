// src/models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true,
    index: true
  },
  currentCompany: {
    type: String,
    index: true
  },
  location: {
    type: String,
    required: true,
    index: true
  },
  skills: [{
    type: String,
    index: true
  }],
  experience: [{
    title: String,
    company: String,
    duration: String,
    description: String
  }],
  url: {
    type: String,
    unique: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create text indexes for search
profileSchema.index({
  name: 'text',
  title: 'text',
  currentCompany: 'text',
  skills: 'text'
});

module.exports = mongoose.model('Profile', profileSchema);