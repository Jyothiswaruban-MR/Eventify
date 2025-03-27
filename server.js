const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config({ path: "./properties.env" });
console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging: Check if MONGO_URI is loaded

const User = require('./models/User'); // Import User model

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const eventRoutes = require("./routes/event");
const profileRoutes =require("./routes/profile");
app.use("/api/events", eventRoutes)
app.use("/api/profiles", profileRoutes)

app.post("/api/auth/register", async (req, res) => {
    const { email, password, role, isApproved, organizationId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
    }

    try {
        // Create new user
        const newUser = new User({ email, password, role, isApproved, organizationId });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Login route
app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if the user exists
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Compare password with the hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token
    const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(200).json({ message: "Login successful", token });
});

app.post("/api/admin/approve/:userId", async(req, res)=>{
    try{
        const user = await User.findById(req.params.userId);
        if(!user) return res.status(404).json({message:"User not found"});
        await User.findByIdAndUpdate(user._id, { isActive: true }, { new: true });

        res.status(200).json({message: "Organizer approved successfully"});
    }catch(error){
        console.error(error);
        res.status(500).json({message : "Error while approving the organizer"});
    }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((error) => {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);  // Exit process with failure code
});


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


