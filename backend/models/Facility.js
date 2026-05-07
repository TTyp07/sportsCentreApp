const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, 
  description: { type: String },
  usageGuidelines: { type: String },
  location: { type: String },
  capacityLimit: { type: Number, default: 1 },
  timeSlotDuration: { type: Number, default: 60 }, 
  availableSlots: [
    {
      day: { type: String }, 
      startTime: { type: String }, 
      endTime: { type: String }  
    }
  ],
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);