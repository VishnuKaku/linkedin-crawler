// src/models/Profile.js
const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
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
    skills: [{
        type: String
    }],
    experience: {
        type: Number
    },
    linkedinUrl: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Profile', profileSchema);