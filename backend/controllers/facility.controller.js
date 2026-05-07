const Facility = require('../models/Facility');
const User = require('../models/User');

const getFacilities = async (req, res) => {
  try {
    const facilities = await Facility.find({ isActive: true })
      .populate('assignedStaff', 'name email');
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFacilityById = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id)
      .populate('assignedStaff', 'name email');
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createFacility = async (req, res) => {
  const { name, type, description, usageGuidelines, location, capacityLimit, timeSlotDuration, availableSlots } = req.body;

  try {
    const facility = await Facility.create({
      name,
      type,
      description,
      usageGuidelines,
      location,
      capacityLimit,
      timeSlotDuration,
      availableSlots
    });
    res.status(201).json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteFacility = async (req, res) => {
  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json({ message: 'Facility removed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const assignStaff = async (req, res) => {
  const { staffId } = req.body;

  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== 'staff') {
      return res.status(404).json({ message: 'Staff member not found' });
    }
    if (!staff.isApproved || staff.isSuspended) {
      return res.status(400).json({ message: 'Staff member is not approved or is suspended' });
    }

    if (!facility.assignedStaff.includes(staffId)) {
      facility.assignedStaff.push(staffId);
      await facility.save();
    }

    if (!staff.assignedFacilities.includes(req.params.id)) {
      staff.assignedFacilities.push(req.params.id);
      await staff.save();
    }

    res.json({ message: 'Staff assigned to facility', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const removeStaff = async (req, res) => {
  const { staffId } = req.body;

  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ message: 'Facility not found' });

    facility.assignedStaff = facility.assignedStaff.filter(
      (id) => id.toString() !== staffId
    );
    await facility.save();

    const staff = await User.findById(staffId);
    if (staff) {
      staff.assignedFacilities = staff.assignedFacilities.filter(
        (id) => id.toString() !== req.params.id
      );
      await staff.save();
    }

    res.json({ message: 'Staff removed from facility', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setCapacityLimit = async (req, res) => {
  const { capacityLimit } = req.body;

  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { capacityLimit },
      { new: true }
    );
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json({ message: 'Capacity limit updated', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const setTimeSlotLimit = async (req, res) => {
  const { timeSlotDuration } = req.body;

  try {
    const facility = await Facility.findByIdAndUpdate(
      req.params.id,
      { timeSlotDuration },
      { new: true }
    );
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json({ message: 'Time slot duration updated', facility });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getFacilityAvailability = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id).select('availableSlots timeSlotDuration capacityLimit');
    if (!facility) return res.status(404).json({ message: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getFacilities,
  getFacilityById,
  createFacility,
  updateFacility,
  deleteFacility,
  assignStaff,
  removeStaff,
  setCapacityLimit,
  setTimeSlotLimit,
  getFacilityAvailability
};