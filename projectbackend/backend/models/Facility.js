const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // e.g. badminton court, football pitch
  description: { type: String },
  image: { type: String, default: '' },
  usageGuidelines: { type: String },
  location: { type: String },
  latitude: { type: Number },
  longitude: { type: Number },
  capacityLimit: { type: Number, default: 1 },
  timeSlotDuration: { type: Number, default: 60 }, // in minutes
  availableSlots: [
    {
      day: { type: String }, // e.g. "Monday"
      startTime: { type: String }, // e.g. "09:00"
      endTime: { type: String }  // e.g. "10:00"
    }
  ],
  assignedStaff: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);