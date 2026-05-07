const express = require('express');
const router = express.Router();
const { registerMember, registerStaff, loginUser, getMe, googleLogin } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authorizeRoles } = require('../middleware/role.middleware');

router.post('/register', registerMember);
router.post('/register-staff', protect, authorizeRoles('admin'), registerStaff);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.get('/me', protect, getMe);

module.exports = router;
