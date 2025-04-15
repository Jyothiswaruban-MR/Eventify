const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Load environment variables
dotenv.config({ path: "./properties.env" });
console.log("MONGO_URI:", process.env.MONGO_URI); // Debugging

const User = require("./models/User"); // Import User model
const { verifyToken, isAdmin } = require("./middleware/authentication"); // Import auth middleware

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const eventRoutes = require("./routes/event");
const profileRoutes = require("./routes/profile");
const supportRoutes = require('./routes/supportRoutes');

app.use('/api/support', supportRoutes);

// Use routes
app.use("/api/events", eventRoutes);
app.use("/api/profiles", profileRoutes);

// Register route
app.post("/api/auth/register", async (req, res) => {
    try {
        const {name, email, password, role, isApproved, organizationId } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        console.log("password is ",password);
        // Hash password
        //const hashedPassword = await bcrypt.hash(password, 10);
        //console.log("Hashed Password:", hashedPassword);

        // Create new user
        const newUser = new User({name, email, password, role, isApproved, organizationId });
        await newUser.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// Login route
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        console.log("login password : ",password);
        // Compare password
        const isMatch = await user.comparePassword(password);
        console.log("isMatch is ",isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!user.isApproved) {
            return res.status(400).json({ message: "User is not approved" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


// ✅ Fetch all pending organizers
app.get('/api/admin/pending-organizers', async (req, res) => {
    try {
        const organizers = await User.find({ role: 'organizer', isApproved: false });
        res.json(organizers);
    } catch (error) {
        console.error("Error fetching organizers:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// ✅ Approve multiple organizers
app.post('/api/admin/approve-organizers', verifyToken, isAdmin, async (req, res) => {
    console.log("request body received: ",req.body);
    try {
        console.log("Incoming request to approve organizers...");
        const { organizerIds } = req.body;
    
        if (!organizerIds || organizerIds.length === 0) {
            console.log("No organizer IDs provided.");
            return res.status(400).json({ message: "No organizer IDs provided" });
        }
    
        console.log("Attempting to update organizers with IDs:", organizerIds);
    
        const updatedOrganizers = await User.updateMany(
            { _id: { $in: organizerIds } },
            { $set: { isApproved: true } }
        );
    
        console.log("Update result:", updatedOrganizers);
    
        if (updatedOrganizers.nModified === 0) {
            console.log("No organizers were updated.");
            return res.status(404).json({ message: "No organizers were updated" });
        }
    
        console.log("Organizers approved successfully:", updatedOrganizers);
        res.json({ message: "Organizers approved successfully", organizers: updatedOrganizers });
    
    } catch (error) {
        console.error("Error while processing the request:", error); // This will log the error with full details
        res.status(500).json({ message: "Server error" });
    }
    
});


// ✅ Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000
    })
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(error => {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    });

// ✅ Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
