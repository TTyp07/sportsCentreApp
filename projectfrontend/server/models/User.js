const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  address: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['member', 'staff', 'admin'], 
    default: 'member' 
  },

  // Staff-specific
  isApproved: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  assignedFacilities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],

  // Member-specific
  membershipActive: { type: Boolean, default: true },

  // Partner matching profile (optional, member only)
  partnerProfile: {
    isVisible: { type: Boolean, default: false },
    preferredSport: { type: String },
    skillLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    availability: { type: String }
  }

}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
  });

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);