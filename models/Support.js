const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    query: {
        type: String,
        required: true,
    },
    submittedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
