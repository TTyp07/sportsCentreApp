const express = require('express');
const router = express.Router();
const { registerMember, registerStaff, loginUser, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.post('/register', registerMember);
router.post('/register-staff', protect, authorizeRoles('admin'), registerStaff);
router.post('/login', loginUser);
router.get('/me', protect, getMe);

module.exports = router;