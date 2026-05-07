const express = require('express');
const router = express.Router();
const {
  getAllStaff,
  getPendingStaff,
  getStaffById,
  approveStaff,
  suspendStaff,
  unsuspendStaff,
  getAllMembers,
  getMemberById,
  getDashboardStats
} = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// All admin only
router.get('/dashboard', protect, authorizeRoles('admin'), getDashboardStats);

// Staff management
router.get('/staff', protect, authorizeRoles('admin'), getAllStaff);
router.get('/staff/pending', protect, authorizeRoles('admin'), getPendingStaff);
router.get('/staff/:id', protect, authorizeRoles('admin'), getStaffById);
router.put('/staff/:id/approve', protect, authorizeRoles('admin'), approveStaff);
router.put('/staff/:id/suspend', protect, authorizeRoles('admin'), suspendStaff);
router.put('/staff/:id/unsuspend', protect, authorizeRoles('admin'), unsuspendStaff);

// Member management
router.get('/members', protect, authorizeRoles('admin'), getAllMembers);
router.get('/members/:id', protect, authorizeRoles('admin'), getMemberById);

module.exports = router;