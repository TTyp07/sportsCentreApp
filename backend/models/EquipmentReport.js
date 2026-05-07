const mongoose = require('mongoose');

const equipmentReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  equipmentDescription: { type: String, required: true },
  issueDescription: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'noted', 'repair_in_progress', 'resolved'], 
    default: 'pending' 
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } 

}, { timestamps: true });

module.exports = mongoose.model('EquipmentReport', equipmentReportSchema);