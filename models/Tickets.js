const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "users", required: true},
    eventId: {type: mongoose.Schema.Types.ObjectId, ref: "events", required: true},
    issuedAt: {type: Date, default: Date.now}
});

module.exports = mongoose.model("Ticket", ticketSchema);