const Booking = require('../models/Booking');
const BookingHistory = require('../models/BookingHistory');
const Facility = require('../models/Facility');
const Notification = require('../models/Notification');


const createBookingRequest = async (req, res) => {
  const { facilityId, intendedActivity, date, startTime, endTime } = req.body;

  try {
    const facility = await Facility.findById(facilityId);
    if (!facility || !facility.isActive) {
      return res.status(404).json({ message: 'Facility not found or inactive' });
    }

    const overlappingBookings = await Booking.countDocuments({
      facility: facilityId,
      date,
      startTime,
      endTime,
      status: 'approved'
    });

    if (overlappingBookings >= facility.capacityLimit) {
      return res.status(400).json({ message: 'Facility is fully booked for this time slot' });
    }

    const booking = await Booking.create({
      member: req.user._id,
      facility: facilityId,
      intendedActivity,
      date,
      startTime,
      endTime,
      status: 'pending'
    });

    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      member: req.user._id,
      status: { $in: ['pending', 'approved', 'alternative_suggested'] }
    })
      .populate('facility', 'name type location')
      .populate('alternativeFacility', 'name type location')
      .sort({ date: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getMyBookingHistory = async (req, res) => {
  try {
    const history = await BookingHistory.find({ member: req.user._id })
      .populate('facility', 'name type location')
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (!['pending', 'approved'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled at this stage' });
    }

    booking.status = 'cancelled';
    await booking.save();


    await BookingHistory.create({
      member: booking.member,
      booking: booking._id,
      facility: booking.facility,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      outcome: 'cancelled'
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getBookingRequests = async (req, res) => {
  try {
    const staffFacilities = req.user.assignedFacilities;

    const bookings = await Booking.find({
      facility: { $in: staffFacilities },
      status: 'pending'
    })
      .populate('member', 'name email')
      .populate('facility', 'name type location')
      .sort({ createdAt: 1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getAllBookingsForStaff = async (req, res) => {
  try {
    const staffFacilities = req.user.assignedFacilities;

    const bookings = await Booking.find({
      facility: { $in: staffFacilities }
    })
      .populate('member', 'name email')
      .populate('facility', 'name type location')
      .populate('alternativeFacility', 'name type location')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('member', 'name email')
      .populate('facility', 'name type location')
      .populate('alternativeFacility', 'name type location')
      .populate('handledBy', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is no longer pending' });
    }

    booking.status = 'approved';
    booking.handledBy = req.user._id;
    await booking.save();

    
    await Notification.create({
      recipient: booking.member,
      message: `Your booking request has been approved.`,
      type: 'booking_approved',
      relatedBooking: booking._id
    });

    res.json({ message: 'Booking approved', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is no longer pending' });
    }

    booking.status = 'rejected';
    booking.handledBy = req.user._id;
    await booking.save();

    
    await BookingHistory.create({
      member: booking.member,
      booking: booking._id,
      facility: booking.facility,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      outcome: 'rejected'
    });


    await Notification.create({
      recipient: booking.member,
      message: `Your booking request has been rejected.`,
      type: 'booking_rejected',
      relatedBooking: booking._id
    });

    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const suggestAlternative = async (req, res) => {
  const { alternativeFacilityId } = req.body;

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'pending') {
      return res.status(400).json({ message: 'Booking is no longer pending' });
    }

    const altFacility = await Facility.findById(alternativeFacilityId);
    if (!altFacility || !altFacility.isActive) {
      return res.status(404).json({ message: 'Alternative facility not found or inactive' });
    }

    booking.status = 'alternative_suggested';
    booking.alternativeFacility = alternativeFacilityId;
    booking.handledBy = req.user._id;
    await booking.save();


    await Notification.create({
      recipient: booking.member,
      message: `An alternative facility "${altFacility.name}" has been suggested for your booking.`,
      type: 'alternative_suggested',
      relatedBooking: booking._id
    });

    res.json({ message: 'Alternative facility suggested', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved bookings can be marked complete' });
    }

    booking.status = 'completed';
    booking.handledBy = req.user._id;
    await booking.save();


    await BookingHistory.create({
      member: booking.member,
      booking: booking._id,
      facility: booking.facility,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      outcome: 'completed'
    });


    await Notification.create({
      recipient: booking.member,
      message: `Your session at the facility has been marked as completed.`,
      type: 'session_completed',
      relatedBooking: booking._id
    });

    res.json({ message: 'Booking marked as completed', booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const cancelMembership = async (req, res) => {
  try {
    req.user.membershipActive = false;
    await req.user.save();

    await Booking.updateMany(
      { member: req.user._id, status: { $in: ['pending', 'approved'] } },
      { status: 'cancelled' }
    );

    res.json({ message: 'Membership cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createBookingRequest,
  getMyBookings,
  getMyBookingHistory,
  cancelBooking,
  getBookingRequests,
  getAllBookingsForStaff,
  getBookingById,
  approveBooking,
  rejectBooking,
  suggestAlternative,
  completeBooking,
  cancelMembership
};