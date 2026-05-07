const User = require('../models/User');
const Booking = require('../models/Booking');
const EquipmentReport = require('../models/EquipmentReport');


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


const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member', membershipActive: true });
    const totalStaff = await User.countDocuments({ role: 'staff' });
    const pendingStaff = await User.countDocuments({ role: 'staff', isApproved: false });
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const totalReports = await EquipmentReport.countDocuments();
    const unresolvedReports = await EquipmentReport.countDocuments({
      status: { $in: ['pending', 'noted', 'repair_in_progress'] }
    });

    res.json({
      totalMembers,
      totalStaff,
      pendingStaff,
      totalBookings,
      pendingBookings,
      totalReports,
      unresolvedReports
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
  getAllMembers,
  getMemberById,
  getDashboardStats
};