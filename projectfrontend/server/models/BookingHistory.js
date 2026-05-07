const mongoose = require('mongoose');

const bookingHistorySchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  date: { type: Date, required: true },
  startTime: { type: String },
  endTime: { type: String },
  outcome: { 
    type: String, 
    enum: ['completed', 'cancelled', 'rejected'], 
    required: true 
  }

}, { timestamps: true });

module.exports = mongoose.model('BookingHistory', bookingHistorySchema);