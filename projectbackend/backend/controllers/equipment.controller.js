const EquipmentReport = require('../models/EquipmentReport');
const Notification = require('../models/Notification');
const Facility = require('../models/Facility');

// ─── MEMBER ───────────────────────────────────────────

// @route   POST /api/equipment
// @access  Member only
const submitReport = async (req, res) => {
  // Destructure with support for both 'facility' and 'facilityId'
  const { facility, facilityId, equipmentDescription, issueDescription } = req.body;
  const idToUse = facility || facilityId;

  try {
    const facilityDoc = await Facility.findById(idToUse);
    if (!facilityDoc) {
      return res.status(404).json({ message: 'Facility not found' });
    }

    const report = await EquipmentReport.create({
      reportedBy: req.user._id,
      facility: idToUse,
      equipmentDescription,
      issueDescription,
      status: 'pending'
    });

    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/equipment/my
// @access  Member only
const getMyReports = async (req, res) => {
  try {
    const reports = await EquipmentReport.find({ reportedBy: req.user._id })
      .populate('facility', 'name type location')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/equipment/:id
// @access  Member (own) / Staff / Admin
const getReportById = async (req, res) => {
  try {
    const report = await EquipmentReport.findById(req.params.id)
      .populate('facility', 'name type location')
      .populate('reportedBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Members can only view their own reports
    if (
      req.user.role === 'member' &&
      report.reportedBy._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── STAFF ────────────────────────────────────────────

// @route   GET /api/equipment
// @access  Staff only
const getAllReports = async (req, res) => {
  try {
    // Staff can only see reports for their assigned facilities
    const staffFacilities = req.user.assignedFacilities;

    const reports = await EquipmentReport.find({
      facility: { $in: staffFacilities }
    })
      .populate('facility', 'name type location')
      .populate('reportedBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/equipment/status/:status
// @access  Staff only
const getReportsByStatus = async (req, res) => {
  const { status } = req.params;
  const validStatuses = ['pending', 'noted', 'repair_in_progress', 'resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const staffFacilities = req.user.assignedFacilities;

    const reports = await EquipmentReport.find({
      facility: { $in: staffFacilities },
      status
    })
      .populate('facility', 'name type location')
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/equipment/:id/status
// @access  Staff only
const updateReportStatus = async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['noted', 'repair_in_progress', 'resolved'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const report = await EquipmentReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    // Make sure staff is assigned to this facility
    const isAssigned = req.user.assignedFacilities
      .map((id) => id.toString())
      .includes(report.facility.toString());

    if (!isAssigned) {
      return res.status(403).json({ message: 'You are not assigned to this facility' });
    }

    report.status = status;
    report.updatedBy = req.user._id;
    await report.save();

    // Notify the member who reported it
    const statusMessages = {
      noted: 'Your equipment report has been noted by staff.',
      repair_in_progress: 'Repair is now in progress for the equipment you reported.',
      resolved: 'The equipment issue you reported has been resolved.'
    };

    await Notification.create({
      recipient: report.reportedBy,
      message: statusMessages[status],
      type: 'equipment_status'
    });

    res.json({ message: 'Report status updated', report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  submitReport,
  getMyReports,
  getReportById,
  getAllReports,
  getReportsByStatus,
  updateReportStatus
};