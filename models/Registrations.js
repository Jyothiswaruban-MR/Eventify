const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: {type: String, required: true},
    eventId: {type: String, required: true},
    status: {type: String, enum:["registered","withdrawn"]}
}, { timestamps: true });

module.exports = mongoose.model("Registrations", registrationSchema);
