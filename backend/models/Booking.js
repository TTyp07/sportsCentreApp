const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  intendedActivity: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled', 'completed', 'alternative_suggested'],
    default: 'pending'
  },
  alternativeFacility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', default: null },
  handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } 

}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);