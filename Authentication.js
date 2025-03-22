const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        // 1. Get the token from the Authorization header
        const token = req.header("Authorization");

        // 2. If there is no token, return an error
        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // 3. Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Find the user associated with the decoded token
        const user = await User.findById(decoded.userId);

        // 5. If the user is not found, return an error
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        // 6. Attach the user to the request object to access in later stages
        req.user = user;

        // 7. Call the next middleware or route handler
        next();
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
