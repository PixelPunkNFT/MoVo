const Favorite = require('../models/Favorite.model');
const Resale = require('../models/Resale.model');

// @desc    Aggiungi/rimuovi preferito
// @route   POST /api/favorites/:resaleId
// @access  Private
exports.toggleFavorite = async (req, res) => {
  try {
    const { resaleId } = req.params;

    const resale = await Resale.findById(resaleId);
    if (!resale) {
      return res.status(404).json({
        success: false,
        message: 'Annuncio non trovato'
      });
    }

    const existing = await Favorite.findOne({
      user: req.user._id,
      resale: resaleId
    });

    if (existing) {
      await existing.deleteOne();
      return res.json({
        success: true,
        data: { isFavorited: false }
      });
    }

    await Favorite.create({
      user: req.user._id,
      resale: resaleId
    });

    res.status(201).json({
      success: true,
      data: { isFavorited: true }
    });
  } catch (error) {
    console.error('Errore toggle favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento dei preferiti',
      error: error.message
    });
  }
};

// @desc    Ottieni i miei preferiti
// @route   GET /api/favorites
// @access  Private
exports.getMyFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate({
        path: 'resale',
        populate: {
          path: 'seller',
          select: 'firstName lastName profilePhoto rating'
        }
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { favorites }
    });
  } catch (error) {
    console.error('Errore get favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei preferiti',
      error: error.message
    });
  }
};

// @desc    Verifica se un annuncio è nei preferiti
// @route   GET /api/favorites/:resaleId/check
// @access  Private
exports.checkFavorite = async (req, res) => {
  try {
    const { resaleId } = req.params;

    const existing = await Favorite.findOne({
      user: req.user._id,
      resale: resaleId
    });

    res.json({
      success: true,
      data: { isFavorited: !!existing }
    });
  } catch (error) {
    console.error('Errore check favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la verifica',
      error: error.message
    });
  }
};
