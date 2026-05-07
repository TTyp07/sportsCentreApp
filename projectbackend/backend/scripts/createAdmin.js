const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    const existing = await User.findOne({ email: 'admin@test.com' });
    if (existing) {
      console.log('Deleting existing admin...');
      await User.deleteOne({ email: 'admin@test.com' });
    }

    // Just pass plain password — User model will hash it automatically
    await User.create({
      name: 'Super Admin',
      dateOfBirth: new Date('1990-01-01'),
      address: 'Admin HQ',
      email: 'admin@test.com',
      password: 'Admin@1234',
      role: 'admin',
      membershipActive: true,
      isApproved: true,
      isSuspended: false,
      partnerProfile: { isVisible: false }
    });

    console.log('Admin created successfully');
    console.log('Email: admin@test.com');
    console.log('Password: Admin@1234');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createAdmin();