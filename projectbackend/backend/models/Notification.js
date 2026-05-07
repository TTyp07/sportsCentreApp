const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: [
      'booking_approved', 
      'booking_rejected', 
      'alternative_suggested', 
      'session_completed', 
      'equipment_status', 
      'partner_request', 
      'partner_response'
    ],
    required: true
  },
  isRead: { type: Boolean, default: false },
  relatedBooking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', default: null },

}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);