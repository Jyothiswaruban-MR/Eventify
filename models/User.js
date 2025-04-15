const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: {type: String},
    age: {type: Number},
    gender: {type: String},
    role: { type: String, enum: ['participant', 'organizer','admin'], default: 'participant' },
    isApproved: { type: Boolean, default: true },
    organizationId: { type: String, required: false },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'events' }]
}, { timestamps: true });

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.comparePassword = async function(password) {
    console.log("Trimmed login password (provided):", password.trim());
    console.log("Trimmed stored password hash:", this.password.trim());

    console.log("the bcrypt password : ", await bcrypt.compare(password, this.password));  // Await the comparison result

        return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
