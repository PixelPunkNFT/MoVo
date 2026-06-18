const User = require('../models/User.model');
const Ride = require('../models/Ride.model');
const Booking = require('../models/Booking.model');
const Review = require('../models/Review.model');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const { logAction } = require('../utils/logger');

// @desc    Dashboard stats
// @route   GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalDrivers, totalRides, totalBookings, totalReviews, activeUsers, pendingBookings] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'vehicles.0': { $exists: true } }),
      Ride.countDocuments(),
      Booking.countDocuments(),
      Review.countDocuments({ isVisible: true }),
      User.countDocuments({ isOnline: true }),
      Booking.countDocuments({ status: 'pending' })
    ]);

    const ridesByStatus = await Ride.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const revenue = await Booking.aggregate([
      { $match: { status: 'completato' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalUsers, totalDrivers, totalRides, totalBookings,
        totalReviews, activeUsers, pendingBookings,
        ridesByStatus: ridesByStatus.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {}),
        totalRevenue: revenue[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isActive } = req.query;
    const query = {};
    if (search) {
      query.$or = [
        { firstName: new RegExp(search, 'i') },
        { lastName: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phone: new RegExp(search, 'i') }
      ];
    }
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: { users, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Ban/unban user
// @route   PUT /api/admin/users/:id/ban
exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'Utente non trovato' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Nonpuoi bannare un amministratore' });

    user.isActive = !user.isActive;
    await user.save();

    logAction(req, 'ban_user', 'admin', 'Utente sospeso/riattivato', { targetUserId: req.params.id });

    res.json({
      success: true,
      message: `Utente ${user.isActive ? 'riattivato' : 'sospeso'} con successo`,
      data: { userId: user._id, isActive: user.isActive }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify user ID
// @route   PUT /api/admin/users/:id/verify
exports.verifyUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { isIDVerified: req.body.verified },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Utente non trovato' });

    logAction(req, 'verify_user', 'admin', 'Verifica utente cambiata', { targetUserId: req.params.id, verified: req.body.verified });

    res.json({
      success: true,
      message: `Verifica ${req.body.verified ? 'completata' : 'rimossa'} per ${user.firstName} ${user.lastName}`,
      data: { userId: user._id, isIDVerified: user.isIDVerified }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all rides
// @route   GET /api/admin/rides
exports.getRides = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) query['destination.name'] = new RegExp(search, 'i');

    const rides = await Ride.find(query)
      .populate('driver', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: { rides, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin cancel any ride
// @route   PUT /api/admin/rides/:id/cancel
exports.adminCancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ success: false, message: 'Passaggio non trovato' });

    ride.status = 'cancellato';
    await ride.save();

    await Booking.updateMany(
      { ride: ride._id, status: { $in: ['pending', 'confermato'] } },
      { status: 'cancellato', cancellationReason: 'Cancellato dall\'amministrazione' }
    );

    logAction(req, 'admin_cancel_ride', 'admin', 'Admin ha cancellato un passaggio', { rideId: req.params.id });

    res.json({ success: true, message: 'Passaggio cancellato dall\'amministratore' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reported reviews
// @route   GET /api/admin/reviews/reported
exports.getReportedReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const reviews = await Review.find({ reported: true })
      .populate('reviewer', 'firstName lastName email')
      .populate('reviewee', 'firstName lastName')
      .sort({ reportedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ reported: true });

    res.json({
      success: true,
      data: { reviews, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Hide/show review
// @route   PUT /api/admin/reviews/:id/toggle-visibility
exports.toggleReviewVisibility = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Recensione non trovata' });

    review.isVisible = !review.isVisible;
    if (review.reported) review.reported = false;
    await review.save();

    logAction(req, 'toggle_review', 'admin', 'Visibilità recensione cambiata', { reviewId: req.params.id });

    res.json({
      success: true,
      message: `Recensione ${review.isVisible ? 'visibile' : 'nascosta'}`,
      data: { reviewId: review._id, isVisible: review.isVisible }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
exports.getBookings = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = {};
    if (status) query.status = status;

    const bookings = await Booking.find(query)
      .populate('passenger', 'firstName lastName email phone')
      .populate('driver', 'firstName lastName email phone')
      .populate('ride', 'departure destination pricePerSeat')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Booking.countDocuments(query);

    res.json({
      success: true,
      data: { bookings, totalPages: Math.ceil(total / limit), currentPage: parseInt(page), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Make user admin
// @route   PUT /api/admin/users/:id/make-admin
exports.makeAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id,
      { role: 'admin' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'Utente non trovato' });

    logAction(req, 'make_admin', 'admin', 'Utente promosso ad admin', { targetUserId: req.params.id });

    res.json({
      success: true,
      message: `${user.firstName} ${user.lastName} è ora amministratore`,
      data: { userId: user._id, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
