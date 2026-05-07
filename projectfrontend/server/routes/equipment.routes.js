const express = require('express');
const router = express.Router();
const {
  submitReport,
  getMyReports,
  getReportById,
  getAllReports,
  getReportsByStatus,
  updateReportStatus
} = require('../controllers/equipment.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, isMemberActive, isStaffApproved } = require('../middleware/role.middleware');

// Member routes
router.post('/', protect, authorizeRoles('member'), isMemberActive, submitReport);
router.get('/my', protect, authorizeRoles('member'), getMyReports);

// Staff routes
router.get('/', protect, authorizeRoles('staff'), isStaffApproved, getAllReports);
router.get('/status/:status', protect, authorizeRoles('staff'), isStaffApproved, getReportsByStatus);
router.put('/:id/status', protect, authorizeRoles('staff'), isStaffApproved, updateReportStatus);

// Shared (member own / staff / admin)
router.get('/:id', protect, authorizeRoles('member', 'staff', 'admin'), getReportById);

module.exports = router;