const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, isMemberActive, isStaffApproved } = require('../middleware/role.middleware');

// Member routes
router.post('/', protect, authorizeRoles('member'), isMemberActive, createBookingRequest);
router.get('/my', protect, authorizeRoles('member'), getMyBookings);
router.get('/history', protect, authorizeRoles('member'), getMyBookingHistory);
router.put('/cancel-membership', protect, authorizeRoles('member'), cancelMembership);
router.put('/:id/cancel', protect, authorizeRoles('member'), cancelBooking);

// Staff & Admin routes
router.get('/requests', protect, authorizeRoles('staff', 'admin'), getBookingRequests);
router.get('/requests/all', protect, authorizeRoles('staff', 'admin'), getAllBookingsForStaff);
router.get('/:id', protect, authorizeRoles('staff', 'admin'), getBookingById);
router.put('/:id/approve', protect, authorizeRoles('staff', 'admin'), approveBooking);
router.put('/:id/reject', protect, authorizeRoles('staff', 'admin'), rejectBooking);
router.put('/:id/suggest-alternative', protect, authorizeRoles('staff', 'admin'), suggestAlternative);
router.put('/:id/complete', protect, authorizeRoles('staff', 'admin'), completeBooking);

module.exports = router;