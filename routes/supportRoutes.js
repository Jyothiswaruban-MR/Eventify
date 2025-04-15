const express = require('express');
const router = express.Router();
const SupportRequest = require('../models/Support');

// POST /api/support - Submit a support request
router.post('/', async (req, res) => {
    const { name, email, query } = req.body;

    if (!name || !email || !query) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const newRequest = new SupportRequest({ name, email, query });
        await newRequest.save();
        res.status(201).json({ message: "Support request submitted successfully." });
    } catch (error) {
        console.error("Error submitting support request:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});

router.get('/', async (req, res) => {
    try {
        const requests = await SupportRequest.find(); // Retrieves all support requests from the database
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error fetching support requests:", error);
        res.status(500).json({ message: "Server error. Please try again later." });
    }
});


module.exports = router;
