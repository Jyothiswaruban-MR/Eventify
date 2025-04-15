const express = require("express");
const router = express.Router();
const Event = require("../models/Events");
const User = require("../models/User");
const mongoose = require('mongoose');
const { verifyToken, isAdmin } = require("../middleware/authentication");  // Ensure correct import

router.get("/", verifyToken, async (req, res) => {
    
        console.log("✅ GET /api/profiles hit");
    console.log("🔹 Extracted User:", req.user);  // Log user from token
    console.log(" id is ",req.user._id);

    if (!req.user || !req.user._id) {
        console.log("❌ User ID missing in token!");
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        
        const user = await User.findById(req.user._id).select("-password");
        console.log("✅ User found:", user);
        if (!user) {
            console.log("❌ User not found in DB!");
            return res.status(404).json({ message: "User not found" });
        }   
        res.status(200).json(user);  // Send user data (excluding password)
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ message: "Error fetching user profile" });
    }
});

router.put("/", verifyToken, async (req, res) => {
    console.log("✅ PUT /api/profiles hit");
    console.log("🔹 Extracted User:", req.user);  // Log user from token

    const { name, age, gender } = req.body;
    if (!name || !age || !gender) {
        return res.status(400).json({ message: "All fields (name, age, gender) are required" });
    }

    try {
        // Find the user by ID and update profile details
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { name, age, gender },
            { new: true, runValidators: true }  // Return the updated user and run validation
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        console.log("✅ User profile updated:", updatedUser);
        res.status(200).json(updatedUser);  // Send updated user data (excluding password)
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Error updating user profile" });
    }
});



module.exports = router;
