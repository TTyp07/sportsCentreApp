const express = require('express');
const router = express.Router();
const {
  updateProfile,
  getMatchableUsers,
  sendRequest,
  getMyRequests,
  respondToRequest
} = require('../controllers/partner.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

// All partner routes require authentication and 'member' role
router.use(protect);
router.use(authorizeRoles('member'));

router.put('/profile', updateProfile);
router.get('/members', getMatchableUsers);
router.get('/requests', getMyRequests);
router.post('/request', sendRequest);
router.put('/request/:id', respondToRequest);

module.exports = router;