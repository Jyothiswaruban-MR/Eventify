const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {type: String, required: true, unique:true},
    password: {type: String, required: true},
    role: { type: String, enum: ["participant", "organizer"], default: "participant" },
    isApproved: { type: Boolean, default: function () { return this.role === "participant" || this.role === "admin"; },
    organizationId: {type: String, required: false},
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }]
}
    
},{timestamps:true});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
