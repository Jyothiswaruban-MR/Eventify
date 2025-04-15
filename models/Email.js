const mongoose = require('mongoose');

// Define the Email Schema
const emailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    emailType: {  // 'registration' or 'withdrawal'
        type: String,
        enum: ['registration', 'withdrawal'],
        required: true
    },
    subject: String,
    content: String,
    sentAt: {
        type: Date,
        default: Date.now
    }
});

// Create the Email Model
const Email = mongoose.model('Email', emailSchema);

module.exports = Email;
