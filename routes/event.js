// routes/event.js
const express = require("express");
const router = express.Router();
const Event = require("../models/Events");
const User = require("../models/User");
const mongoose = require('mongoose');

const { verifyToken, isAdmin } = require("../middleware/authentication");

// Get all events (no authentication needed)
router.get("/", async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching events" });
    }
});

// Get events for the current organizer
router.get("/organizer", verifyToken, async (req, res) => {
    try {
        const organizerId = req.user.userId; // ✅ Use correct property name
        const events = await Event.find({ organizerId });
        res.status(200).json({ events });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching organizer's events" });
    }
});

router.get("/registered", verifyToken, async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user || !user.tickets || user.tickets.length === 0) {
            return res.status(200).json([]); // No registered events
        }

        const registeredEvents = await Event.find({ _id: { $in: user.tickets } });
        res.status(200).json(registeredEvents);
    } catch (err) {
        console.error("❌ Error fetching registered events:", err);
        res.status(500).json({ message: "Error fetching registered events" });
    }
});


// Create an event (must be authenticated)
router.post("/", verifyToken, async (req, res) => {
    console.log("Decoded user:", req.user); // Debugging
    const { title, category, date, time, location, description, capacity } = req.body;
    const organizerId = req.user?.userId || req.user?.id; // Ensure correct extraction
    console.log("organizerId is ",organizerId);
    if (!organizerId) {
        console.error("Error: Organizer ID is missing!");
        return res.status(400).json({ message: "Organizer ID is missing from token" });
    }

    try {
        const newEvent = new Event({
            title,
            category,
            date: new Date(date),
            time,
            location,
            description,
            capacity: Number(capacity),
            organizerId, // This must be a valid value
            attendees: []
        });

        console.log("new Event being passed is ",newEvent);
        await newEvent.save();
        res.status(201).json({ message: "Event created successfully", event: newEvent });
    } catch (error) {
        console.error("Error creating event:", error);
        res.status(500).json({ message: "Error creating event", error });
    }
});


// Get event by ID (no authentication needed)
router.get("/organizer/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate if ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid organizer ID format" });
        }

        // Fetch events by organizerId from the database
        const events = await Event.find({ organizerId: id }).lean();
        if (!events || events.length === 0) {
            return res.status(404).json({ message: "No events found for this organizer" });
        }

        res.status(200).json({ events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


// Update event (must be the organizer or an admin)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        console.log("Request Params:", req.params);  // Debugging step
        console.log("Request Body:", req.body);      // Debugging step
        console.log("User ID from Auth:", req.user); // Log entire req.user to debug

        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Unauthorized: No user info found" });
        }

        const { id } = req.params;
        console.log("The ID is:", id);
        const { title, date, time, location, description, capacity } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const updatedEvent = await Event.findOneAndUpdate(
            { _id: id, organizerId: req.user.id }, // Ensure user has permission
            { title, date, time, location, description, capacity },
            { new: true, runValidators: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found or unauthorized" });
        }

        res.status(200).json({ success: true, event: updatedEvent });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Error updating event" });
    }
});

module.exports = router;

// Delete event (must be the organizer or an admin)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        // First, get the event to check ownership
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        
        // Check if the current user is the organizer or an admin
        if (event.organizerId.toString() !== req.user.id && !req.user.isAdmin) {
            return res.status(403).json({ message: "Unauthorized: You can only delete your own events" });
        }
        
        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Event deleted successfully", success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error deleting event", success: false });
    }
});

// Register for an event (must be authenticated)
// POST Register for Event
router.post("/:eventId/register", verifyToken, async (req, res) => {
    const eventId = req.params.eventId;
    console.log("✅ POST /api/events/:eventId/register hit");
    console.log("🔹 Extracted User:", req.user);  // Log user from token

    try {
        // Convert eventId to ObjectId to ensure type consistency
        const eventObjectId = new mongoose.Types.ObjectId(eventId);
        
        // Find the event by ID
        const event = await Event.findById(eventObjectId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Check if the event has available capacity
        if (event.capacity <= 0) {
            console.log("❌ Event is fully booked");
            return res.status(400).json({ message: "Event is fully booked" });
        }

        // Make sure to use findById with the correct ObjectId
        const userId = new mongoose.Types.ObjectId(req.user._id);
        const user = await User.findById(userId);
        
        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        // Initialize tickets array if it doesn't exist
        if (!user.tickets) {
            user.tickets = [];
        }

        // Log current state of the user's tickets
        console.log("🔹 User's current tickets before registration:", user.tickets);

        // Check if the user is already registered for this event
        // Use toString() to compare ObjectId with string
        if (user.tickets.some(ticket => ticket.toString() === eventId)) {
            console.log("❌ User is already registered for this event");
            return res.status(400).json({ message: "You are already registered for this event" });
        }

        // Add event to the user's tickets array as ObjectId
        user.tickets.push(eventObjectId);
        console.log("🔹 User's tickets after push:", user.tickets);

        // Add user to the event's attendees array
        if (!event.attendees) {
            event.attendees = [];
        }
        event.attendees.push(userId);

        // Decrease event capacity
        event.capacity -= 1;

        // Log before saving
        console.log("✅ Before saving, User's tickets:", user.tickets);
        console.log("✅ Before saving, Event's remaining capacity:", event.capacity);

        // Save the updated user and event
        await Promise.all([
            user.save(),
            event.save()
        ]);

        console.log("✅ User and event saved successfully");
        
        // Log the user again after saving to verify the tickets were saved
        const updatedUser = await User.findById(userId);
        console.log("✅ User after save:", updatedUser);

        // Return success message
        res.status(200).json({ message: "Successfully registered for the event" });

    } catch (error) {
        console.error("❌ Error registering for event:", error);
        res.status(500).json({ message: "Error registering for event" });
    }
}); 

// Cancel registration for an event (must be authenticated)
router.delete("/:eventId/withdraw", verifyToken, async (req, res) => {
    const eventId = req.params.eventId;
    console.log("✅ POST /api/events/:eventId/withdraw hit");
    console.log("🔹 Extracted User:", req.user);  // Log user from token

    try {
        const eventObjectId = new mongoose.Types.ObjectId(eventId);
        const userId = new mongoose.Types.ObjectId(req.user._id);

        // Find the event and user
        const [event, user] = await Promise.all([
            Event.findById(eventObjectId),
            User.findById(userId)
        ]);

        if (!event) {
            console.log("❌ Event not found");
            return res.status(404).json({ message: "Event not found" });
        }

        if (!user) {
            console.log("❌ User not found");
            return res.status(404).json({ message: "User not found" });
        }

        // Ensure tickets and attendees arrays exist
        user.tickets = user.tickets || [];
        event.attendees = event.attendees || [];

        // Check if user is registered for the event
        if (!user.tickets.some(ticket => ticket.toString() === eventId)) {
            console.log("❌ User is not registered for this event");
            return res.status(400).json({ message: "You are not registered for this event" });
        }

        // Remove the event from user's tickets
        user.tickets = user.tickets.filter(ticket => ticket.toString() !== eventId);
        console.log("🔹 User's tickets after withdrawal:", user.tickets);

        // Remove user from event's attendees
        event.attendees = event.attendees.filter(id => id.toString() !== userId.toString());
        console.log("🔹 Event's attendees after withdrawal:", event.attendees);

        // Increase event capacity
        event.capacity += 1;
        console.log("✅ Event capacity after withdrawal:", event.capacity);

        // Save both user and event
        await Promise.all([
            user.save(),
            event.save()
        ]);

        console.log("✅ User and event updated after withdrawal");
        res.status(200).json({ message: "Successfully withdrawn from the event" });

    } catch (error) {
        console.error("❌ Error withdrawing from event:", error);
        res.status(500).json({ message: "Error withdrawing from event" });
    }
});


module.exports = router;