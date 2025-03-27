const express = require("express");
const router = express.Router();
const Event = require("../models/Events");
const User = require("../models/User");
const authenticate = require("../Authentication");

router.get("api/profile", authenticate, async(req, res)=>{
    try{
        const user = await User.findById(req.user._id).select("-password");
        if(!user)return res.status(404).json({message: "User not found"});
        res.status(200).json(user);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Error fetching user profile"});
    }
});