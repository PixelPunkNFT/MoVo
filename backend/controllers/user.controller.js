const User = require('../models/User.model');

// @desc    Get profilo utente pubblico
// @route   GET /api/users/:userId
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utente non trovato'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          profilePhoto: user.profilePhoto,
          bio: user.bio,
          age: user.age,
          rating: user.rating,
          totalReviews: user.totalReviews,
          totalRidesAsDriver: user.totalRidesAsDriver,
          totalRidesAsPassenger: user.totalRidesAsPassenger,
          vehicles: user.vehicles,
          preferences: user.preferences,
          socialLinks: user.socialLinks,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Errore get user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del profilo',
      error: error.message
    });
  }
};

// @desc    Cerca utenti
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Query di ricerca obbligatoria'
      });
    }

    const searchQuery = {
      $or: [
        { firstName: new RegExp(query, 'i') },
        { lastName: new RegExp(query, 'i') },
        { email: new RegExp(query, 'i') }
      ],
      isActive: true
    };

    const users = await User.find(searchQuery)
      .select('firstName lastName profilePhoto rating totalReviews')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Errore search users:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la ricerca',
      error: error.message
    });
  }
};
