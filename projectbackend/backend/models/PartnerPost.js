const mongoose = require('mongoose');

const partnerPostSchema = new mongoose.Schema({
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sport: { type: String, required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  description: { type: String },
  maxPlayers: { type: Number, required: true },
  joinedPlayers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { 
    type: String, 
    enum: ['open', 'full', 'completed', 'cancelled'], 
    default: 'open' 
  }
}, { timestamps: true });

module.exports = mongoose.model('PartnerPost', partnerPostSchema);
