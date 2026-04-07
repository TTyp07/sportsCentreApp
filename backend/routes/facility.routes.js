const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/facility.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// Public
router.get('/', getFacilities);
router.get('/:id', getFacilityById);
router.get('/:id/availability', getFacilityAvailability);

// Admin only
router.post('/', protect, authorizeRoles('admin'), createFacility);
router.put('/:id', protect, authorizeRoles('admin'), updateFacility);
router.delete('/:id', protect, authorizeRoles('admin'), deleteFacility);
router.put('/:id/assign-staff', protect, authorizeRoles('admin'), assignStaff);
router.put('/:id/remove-staff', protect, authorizeRoles('admin'), removeStaff);
router.put('/:id/capacity', protect, authorizeRoles('admin'), setCapacityLimit);
router.put('/:id/timeslot', protect, authorizeRoles('admin'), setTimeSlotLimit);

module.exports = router;