const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyToken = async (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // Remove "Bearer " from token if present
        if (token.startsWith("Bearer ")) {
            token = token.slice(7).trim();
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("decoded jwt ",decoded);
        // Fetch user from DB
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // Attach user to request
        next();
    } catch (error) {
        console.error("JWT Error:", error.message);
        
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired. Please log in again." });
        } else if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token. Authentication failed." });
        }

        res.status(500).json({ message: "Server error" });
    }
};

const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
    }
    next();
};

// ✅ Export Both Middleware Functions
module.exports = { verifyToken, isAdmin };
