const express = require('express');
const router = express.Router();
const {
  updatePartnerProfile,
  getMyPartnerProfile,
  searchPartners,
  sendPartnerRequest,
  getSentRequests,
  getReceivedRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
  arrangeSession
} = require('../controllers/partner.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles, isMemberActive } = require('../middleware/role.middleware');

router.get('/profile', protect, authorizeRoles('member'), getMyPartnerProfile);
router.put('/profile', protect, authorizeRoles('member'), isMemberActive, updatePartnerProfile);
router.get('/search', protect, authorizeRoles('member'), isMemberActive, searchPartners);
router.post('/request', protect, authorizeRoles('member'), isMemberActive, sendPartnerRequest);
router.get('/requests/sent', protect, authorizeRoles('member'), getSentRequests);
router.get('/requests/received', protect, authorizeRoles('member'), getReceivedRequests);
router.put('/requests/:id/accept', protect, authorizeRoles('member'), acceptPartnerRequest);
router.put('/requests/:id/reject', protect, authorizeRoles('member'), rejectPartnerRequest);
router.put('/requests/:id/arrange-session', protect, authorizeRoles('member'), arrangeSession);

module.exports = router;