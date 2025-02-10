// src/models/phone.js
const mongoose = require('mongoose');

const phoneSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    PhoneNumber: { type: String, required: true }
});

module.exports = mongoose.model('Student', phoneSchema, 'phone'); // Ensure the model name is 'Phone'
