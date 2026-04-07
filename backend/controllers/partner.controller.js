const PartnerMatch = require('../models/PartnerMatch');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── PROFILE ──────────────────────────────────────────

// @route   PUT /api/partners/profile
// @access  Member only
const updatePartnerProfile = async (req, res) => {
  const { isVisible, preferredSport, skillLevel, availability } = req.body;

  try {
    const user = await User.findById(req.user._id);

    user.partnerProfile = {
      isVisible: isVisible ?? user.partnerProfile.isVisible,
      preferredSport: preferredSport || user.partnerProfile.preferredSport,
      skillLevel: skillLevel || user.partnerProfile.skillLevel,
      availability: availability || user.partnerProfile.availability
    };

    await user.save();
    res.json({ message: 'Partner profile updated', partnerProfile: user.partnerProfile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/partners/profile
// @access  Member only
const getMyPartnerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('partnerProfile');
    res.json(user.partnerProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── BROWSE / SEARCH ──────────────────────────────────

// @route   GET /api/partners/search
// @access  Member only
// @query   sport, skillLevel
const searchPartners = async (req, res) => {
  const { sport, skillLevel } = req.query;

  try {
    const filter = {
      _id: { $ne: req.user._id }, // exclude self
      role: 'member',
      membershipActive: true,
      'partnerProfile.isVisible': true
    };

    if (sport) filter['partnerProfile.preferredSport'] = { $regex: sport, $options: 'i' };
    if (skillLevel) filter['partnerProfile.skillLevel'] = skillLevel;

    const partners = await User.find(filter).select(
      'name partnerProfile'
    );

    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── REQUESTS ─────────────────────────────────────────

// @route   POST /api/partners/request
// @access  Member only
const sendPartnerRequest = async (req, res) => {
  const { recipientId, sport, proposedDate, proposedFacilityId } = req.body;

  try {
    if (recipientId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot send a request to yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient || recipient.role !== 'member' || !recipient.membershipActive) {
      return res.status(404).json({ message: 'Member not found or inactive' });
    }

    // Check if request already exists
    const existing = await PartnerMatch.findOne({
      requester: req.user._id,
      recipient: recipientId,
      status: 'pending'
    });
    if (existing) {
      return res.status(400).json({ message: 'You already have a pending request to this member' });
    }

    const partnerRequest = await PartnerMatch.create({
      requester: req.user._id,
      recipient: recipientId,
      sport,
      proposedSession: {
        date: proposedDate || null,
        facility: proposedFacilityId || null
      }
    });

    // Notify recipient
    await Notification.create({
      recipient: recipientId,
      message: `${req.user.name} has sent you a partner request for ${sport}.`,
      type: 'partner_request'
    });

    res.status(201).json(partnerRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/partners/requests/sent
// @access  Member only
const getSentRequests = async (req, res) => {
  try {
    const requests = await PartnerMatch.find({ requester: req.user._id })
      .populate('recipient', 'name partnerProfile')
      .populate('proposedSession.facility', 'name type location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   GET /api/partners/requests/received
// @access  Member only
const getReceivedRequests = async (req, res) => {
  try {
    const requests = await PartnerMatch.find({ recipient: req.user._id })
      .populate('requester', 'name partnerProfile')
      .populate('proposedSession.facility', 'name type location')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/partners/requests/:id/accept
// @access  Member only
const acceptPartnerRequest = async (req, res) => {
  try {
    const request = await PartnerMatch.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    request.status = 'accepted';
    await request.save();

    // Notify requester
    await Notification.create({
      recipient: request.requester,
      message: `${req.user.name} has accepted your partner request.`,
      type: 'partner_request'
    });

    res.json({ message: 'Partner request accepted', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/partners/requests/:id/reject
// @access  Member only
const rejectPartnerRequest = async (req, res) => {
  try {
    const request = await PartnerMatch.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request is no longer pending' });
    }

    request.status = 'rejected';
    await request.save();

    // Notify requester
    await Notification.create({
      recipient: request.requester,
      message: `${req.user.name} has declined your partner request.`,
      type: 'partner_request'
    });

    res.json({ message: 'Partner request rejected', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route   PUT /api/partners/requests/:id/arrange-session
// @access  Member only (either party of an accepted request)
const arrangeSession = async (req, res) => {
  const { proposedDate, proposedFacilityId } = req.body;

  try {
    const request = await PartnerMatch.findById(req.params.id);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    const isParty =
      request.requester.toString() === req.user._id.toString() ||
      request.recipient.toString() === req.user._id.toString();

    if (!isParty) return res.status(403).json({ message: 'Not authorized' });
    if (request.status !== 'accepted') {
      return res.status(400).json({ message: 'Request must be accepted before arranging a session' });
    }

    request.proposedSession = {
      date: proposedDate,
      facility: proposedFacilityId
    };
    await request.save();

    // Notify the other party
    const otherParty =
      request.requester.toString() === req.user._id.toString()
        ? request.recipient
        : request.requester;

    await Notification.create({
      recipient: otherParty,
      message: `${req.user.name} has proposed a session arrangement.`,
      type: 'partner_request'
    });

    res.json({ message: 'Session arranged', request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  updatePartnerProfile,
  getMyPartnerProfile,
  searchPartners,
  sendPartnerRequest,
  getSentRequests,
  getReceivedRequests,
  acceptPartnerRequest,
  rejectPartnerRequest,
  arrangeSession
};