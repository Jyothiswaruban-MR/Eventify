const mongoose = require("mongoose");

const supportSchema = new mongoose.Schema({
    userId:{type: mongoose.Schema.Types.ObjectId, ref:"users"},
    query:{type: String, required: true},
    response:{type: String, default: null},
    isResolved:{type: Boolean, default: false}
});

module.exports = mongoose.model("Support",supportSchema);