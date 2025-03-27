const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    ticketPrice:{type: Number, required:true},
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    status: {type: String, enum: ["upcoming", "ongoing","cancelled","completed"]},
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  isFull: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
