const express = require("express");
const router = express.Router();
const Event = require("../models/Events");
const User = require("../models/User");
const authenticate = require("../middleware/authentication");   
// Create an event
router.post("/",authenticate ,async (req, res) => {
    const { title, category, date, time, location, description, capacity } = req.body;
    try {
        const newEvent = new Event({ title, category, date, time, location, description, capacity });
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error creating event" });
    }
});

// Get event by ID
router.get("/:id",authenticate ,async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.status(200).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching event" });
    }
});

// Update event
router.put("/:id", authenticate,async (req, res) => {
    const { title, category, date, time, location, description, capacity } = req.body;
    try {
        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            { title, category, date, time, location, description, capacity },
            { new: true }
        );
        if (!updatedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ message: "Event updated successfully", event: updatedEvent });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating event" });
    }
});

// Delete event
router.delete("/:id",authenticate ,async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: "Event not found" });
        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting event" });
    }
});

// Register user for an event
router.post("/:eventId/register/:userId", async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        if (event.attendees.includes(user._id)) {
            return res.status(400).json({ message: "User already registered for this event" });
        }

        if (event.attendees.length >= event.capacity) {
            return res.status(400).json({ message: "Event is full" });
        }

        // Add user to event's attendee list
        event.attendees.push(user._id);
        await event.save();

        // Add the event to user's tickets list
        user.tickets.push(event._id);
        await user.save();

        res.status(200).json({ message: "Registration successful", event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering for event" });
    }
});


// Cancel registration
router.post("/:eventId/cancel/:userId",authenticate, async (req, res) => {
    try {
        const event = await Event.findById(req.params.eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });

        event.attendees = event.attendees.filter(attendee => attendee.toString() !== req.params.userId);
        await event.save();
        res.status(200).json({ message: "Registration canceled", event });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error canceling registration" });
    }
});

module.exports = router;
