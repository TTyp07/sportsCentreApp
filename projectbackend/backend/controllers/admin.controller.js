const User = require('../models/User');
const Booking = require('../models/Booking');
const EquipmentReport = require('../models/EquipmentReport');
const Facility = require('../models/Facility');

// ─── STAFF MANAGEMENT ─────────────────────────────────

// @route   GET /api/admin/staff
// @access  Admin only
const getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff' })
      .populate('assignedFacilities', 'name type location')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/admin/staff/pending
// @access  Admin only
const getPendingStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: 'staff', isApproved: false, isSuspended: false })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/admin/staff/:id
// @access  Admin only
const getStaffById = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' })
      .populate('assignedFacilities', 'name type location')
      .select('-password');

    if (!staff) return res.status(404).json({ message: 'Staff member not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/admin/staff/:id/approve
// @access  Admin only
const approveStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (staff.isApproved) {
      return res.status(400).json({ message: 'Staff member is already approved' });
    }

    staff.isApproved = true;
    staff.isSuspended = false;
    await staff.save();

    res.json({ message: 'Staff account approved', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/admin/staff/:id/suspend
// @access  Admin only
const suspendStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (staff.isSuspended) {
      return res.status(400).json({ message: 'Staff member is already suspended' });
    }

    staff.isSuspended = true;
    await staff.save();

    res.json({ message: 'Staff account suspended', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/admin/staff/:id/unsuspend
// @access  Admin only
const unsuspendStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    if (!staff.isSuspended) {
      return res.status(400).json({ message: 'Staff member is not suspended' });
    }

    staff.isSuspended = false;
    await staff.save();

    res.json({ message: 'Staff account unsuspended', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/admin/staff/:id/assign-facilities
// @access  Admin only
const updateStaffFacilities = async (req, res) => {
  const { facilityIds } = req.body; // Array of IDs
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' });
    if (!staff) return res.status(404).json({ message: 'Staff member not found' });

    staff.assignedFacilities = facilityIds;
    await staff.save();

    res.json({ message: 'Facilities assigned successfully', staff });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── MEMBER MANAGEMENT ────────────────────────────────

// @route   GET /api/admin/members
// @access  Admin only
const getAllMembers = async (req, res) => {
  try {
    const members = await User.find({ role: 'member' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/admin/members/:id
// @access  Admin only
const getMemberById = async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, role: 'member' })
      .select('-password');

    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────

// @route   GET /api/admin/dashboard
// @access  Admin only
const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const totalFacilities = await Facility.countDocuments({ isActive: true });
    const pendingStaff = await User.countDocuments({ role: 'staff', isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const approvedBookings = await Booking.countDocuments({ status: 'approved' });
    const totalReports = await EquipmentReport.countDocuments();
    const unresolvedReports = await EquipmentReport.countDocuments({
      status: { $in: ['pending', 'noted', 'repair_in_progress'] }
    });
    
    // Real server uptime
    const serverUptime = process.uptime();

    // Fetch Recent Activity for the log
    const recentBookings = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('member', 'name')
      .lean();
    
    const recentReports = await EquipmentReport.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('facility', 'name')
      .lean();

    const recentActivity = [
      ...recentBookings.map(b => ({
        type: 'booking',
        msg: `Booking ${b.status}: ${b.member?.name || 'User'}`,
        time: b.createdAt,
        status: b.status === 'approved' ? 'success' : b.status === 'pending' ? 'info' : 'warn'
      })),
      ...recentReports.map(r => ({
        type: 'report',
        msg: `Report: ${r.issueDescription.substring(0, 20)}...`,
        time: r.createdAt,
        status: 'warn'
      }))
    ].sort((a, b) => b.time - a.time).slice(0, 10);

    res.json({
      totalMembers,
      totalStaff,
      totalFacilities,
      pendingStaff,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalReports,
      unresolvedReports,
      serverUptime,
      recentActivity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllStaff,
  getPendingStaff,
  getStaffById,
  approveStaff,
  suspendStaff,
  unsuspendStaff,
  updateStaffFacilities,
  getAllMembers,
  getMemberById,
  getDashboardStats
};