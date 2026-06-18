const Notification = require('../models/Notification.model');

// @desc    Ottieni le mie notifiche
// @route   GET /api/notifications
// @access  Private
exports.getMyNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Notification.countDocuments({ user: req.user._id });

    res.json({
      success: true,
      data: {
        notifications,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
        unreadCount: await Notification.countDocuments({ user: req.user._id, read: false })
      }
    });
  } catch (error) {
    console.error('Errore get notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle notifiche',
      error: error.message
    });
  }
};

// @desc    Segna notifica come letta
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notifica non trovata'
      });
    }

    res.json({
      success: true,
      data: { notification }
    });
  } catch (error) {
    console.error('Errore mark as read:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento della notifica',
      error: error.message
    });
  }
};

// @desc    Segna tutte le notifiche come lette
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'Tutte le notifiche segnate come lette'
    });
  } catch (error) {
    console.error('Errore mark all as read:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento delle notifiche',
      error: error.message
    });
  }
};

// @desc    Ottieni conteggio notifiche non lette
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      user: req.user._id,
      read: false
    });

    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Errore unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del conteggio',
      error: error.message
    });
  }
};
