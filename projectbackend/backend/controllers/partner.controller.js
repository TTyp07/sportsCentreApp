const User = require('../models/User');
const PartnerRequest = require('../models/PartnerRequest');
const Notification = require('../models/Notification');

// @desc    Update partner matching profile
// @route   PUT /api/partners/profile
const updateProfile = async (req, res) => {
  const { isVisible, preferredSport, skillLevel, availability } = req.body;

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.partnerProfile = {
      isVisible,
      preferredSport,
      skillLevel,
      availability
    };

    await user.save();
    res.json({ message: 'Profile updated successfully', profile: user.partnerProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get all users looking for partners
// @route   GET /api/partners/members
const getMatchableUsers = async (req, res) => {
  const { sport } = req.query;
  const query = {
    'partnerProfile.isVisible': true,
    _id: { $ne: req.user._id } // Don't show current user
  };

  if (sport && sport !== 'All') {
    query['partnerProfile.preferredSport'] = sport;
  }

  try {
    const users = await User.find(query)
      .select('name partnerProfile email')
      .sort({ updatedAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Send partner request
// @route   POST /api/partners/request
const sendRequest = async (req, res) => {
  const { recipientId, sport, message } = req.body;

  try {
    // Check if request already exists
    const existing = await PartnerRequest.findOne({
      sender: req.user._id,
      recipient: recipientId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'Request already pending' });
    }

    const request = await PartnerRequest.create({
      sender: req.user._id,
      recipient: recipientId,
      sport,
      message
    });

    // Create notification for recipient
    await Notification.create({
      recipient: recipientId,
      message: `${req.user.name} sent you a partner request for ${sport}!`,
      type: 'partner_request'
    });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get my partner requests (sent and received)
// @route   GET /api/partners/requests
const getMyRequests = async (req, res) => {
  try {
    const received = await PartnerRequest.find({ recipient: req.user._id })
      .populate('sender', 'name email partnerProfile')
      .sort({ createdAt: -1 });
    
    const sent = await PartnerRequest.find({ sender: req.user._id })
      .populate('recipient', 'name email partnerProfile')
      .sort({ createdAt: -1 });

    res.json({ received, sent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Respond to partner request
// @route   PUT /api/partners/request/:id
const respondToRequest = async (req, res) => {
  const { status } = req.body; // 'accepted' or 'rejected'
  
  try {
    const request = await PartnerRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    request.status = status;
    await request.save();

    // Notify sender
    await Notification.create({
      recipient: request.sender,
      message: `${req.user.name} has ${status} your partner request for ${request.sport}.`,
      type: 'partner_response'
    });

    res.json({ message: `Request ${status}`, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updateProfile,
  getMatchableUsers,
  sendRequest,
  getMyRequests,
  respondToRequest
};