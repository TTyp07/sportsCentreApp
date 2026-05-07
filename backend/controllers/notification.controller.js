const Notification = require('../models/Notification');

const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('relatedBooking')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUnreadNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
      isRead: false
    })
      .populate('relatedBooking')
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    if (notification.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification
};