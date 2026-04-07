const mongoose = require('mongoose');

const partnerMatchSchema = new mongoose.Schema({
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected'], 
    default: 'pending' 
  },
  proposedSession: {
    date: { type: Date },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }
  }

}, { timestamps: true });

module.exports = mongoose.model('PartnerMatch', partnerMatchSchema);