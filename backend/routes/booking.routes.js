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

router.post('/', protect, authorizeRoles('member'), isMemberActive, createBookingRequest);
router.get('/my', protect, authorizeRoles('member'), getMyBookings);
router.get('/history', protect, authorizeRoles('member'), getMyBookingHistory);
router.put('/cancel-membership', protect, authorizeRoles('member'), cancelMembership);
router.put('/:id/cancel', protect, authorizeRoles('member'), cancelBooking);

router.get('/requests', protect, authorizeRoles('staff'), isStaffApproved, getBookingRequests);
router.get('/requests/all', protect, authorizeRoles('staff'), isStaffApproved, getAllBookingsForStaff);
router.get('/:id', protect, authorizeRoles('staff', 'admin'), getBookingById);
router.put('/:id/approve', protect, authorizeRoles('staff'), isStaffApproved, approveBooking);
router.put('/:id/reject', protect, authorizeRoles('staff'), isStaffApproved, rejectBooking);
router.put('/:id/suggest-alternative', protect, authorizeRoles('staff'), isStaffApproved, suggestAlternative);
router.put('/:id/complete', protect, authorizeRoles('staff'), isStaffApproved, completeBooking);

module.exports = router;