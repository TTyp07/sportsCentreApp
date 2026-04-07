const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @route   POST /api/auth/register
// @access  Public
const registerMember = async (req, res) => {
  const { name, dateOfBirth, address, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      dateOfBirth,
      address,
      email,
      password,
      role: 'member'
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/auth/register-staff
// @access  Admin only
const registerStaff = async (req, res) => {
  const { name, dateOfBirth, address, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({
      name,
      dateOfBirth,
      address,
      email,
      password,
      role: 'staff',
      isApproved: false
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Block suspended staff
    if (user.role === 'staff' && user.isSuspended) {
      return res.status(403).json({ message: 'Your account has been suspended' });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      membershipActive: user.membershipActive,
      token: generateToken(user._id)
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { registerMember, registerStaff, loginUser, getMe };