const Review = require('../models/Review.model');
const Booking = require('../models/Booking.model');

// @desc    Aggiungi recensione
// @route   POST /api/reviews/:bookingId
// @access  Private
exports.addReview = async (req, res) => {
  try {
    const { overallRating, ratings, comment, positiveTags, negativeTags, reviewType } = req.body;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Prenotazione non trovata'
      });
    }

    // Verifica che la prenotazione sia completata
    if (booking.status !== 'completato') {
      return res.status(400).json({
        success: false,
        message: 'Puoi recensire solo prenotazioni completate'
      });
    }

    // Determina chi sta recensendo chi
    let reviewee;
    if (req.user._id.toString() === booking.passenger.toString()) {
      // Il passeggero recensisce il driver
      reviewee = booking.driver;
      if (reviewType !== 'driver') {
        return res.status(400).json({
          success: false,
          message: 'Come passeggero puoi solo recensire il driver'
        });
      }
    } else if (req.user._id.toString() === booking.driver.toString()) {
      // Il driver recensisce il passeggero
      reviewee = booking.passenger;
      if (reviewType !== 'passenger') {
        return res.status(400).json({
          success: false,
          message: 'Come driver puoi solo recensire il passeggero'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Non sei parte di questa prenotazione'
      });
    }

    // Controlla se esiste già una recensione
    const existingReview = await Review.findOne({
      booking: bookingId,
      reviewer: req.user._id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'Hai già lasciato una recensione per questa prenotazione'
      });
    }

    // Crea recensione
    const review = await Review.create({
      ride: booking.ride,
      booking: bookingId,
      reviewer: req.user._id,
      reviewee,
      reviewType,
      overallRating,
      ratings,
      comment,
      positiveTags,
      negativeTags
    });

    // Aggiorna booking con la recensione
    booking.review = review._id;
    await booking.save();

    await review.populate([
      { path: 'reviewer', select: 'firstName lastName profilePhoto' },
      { path: 'reviewee', select: 'firstName lastName profilePhoto rating' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Recensione pubblicata con successo',
      data: { review }
    });
  } catch (error) {
    console.error('Errore aggiunta recensione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiunta della recensione',
      error: error.message
    });
  }
};

// @desc    Get recensioni di un utente
// @route   GET /api/reviews/user/:userId
// @access  Public
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.find({
      reviewee: userId,
      isVisible: true
    })
      .populate('reviewer', 'firstName lastName profilePhoto')
      .populate('ride', 'departure destination')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Review.countDocuments({
      reviewee: userId,
      isVisible: true
    });

    // Calcola statistiche
    const stats = await Review.calculateAverageRating(userId);

    res.json({
      success: true,
      data: {
        reviews,
        stats,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Errore get user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle recensioni',
      error: error.message
    });
  }
};

// @desc    Rispondi a una recensione
// @route   POST /api/reviews/:id/response
// @access  Private
exports.respondToReview = async (req, res) => {
  try {
    const { text } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    // Verifica che l'utente sia quello recensito
    if (review.reviewee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Puoi rispondere solo alle recensioni su di te'
      });
    }

    review.response = {
      text,
      createdAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      message: 'Risposta pubblicata',
      data: { review }
    });
  } catch (error) {
    console.error('Errore risposta recensione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la risposta',
      error: error.message
    });
  }
};

// @desc    Segnala recensione
// @route   POST /api/reviews/:id/report
// @access  Private
exports.reportReview = async (req, res) => {
  try {
    const { reason } = req.body;
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Recensione non trovata'
      });
    }

    review.reported = true;
    review.reportReason = reason;
    review.reportedAt = new Date();
    await review.save();

    res.json({
      success: true,
      message: 'Recensione segnalata. Sarà verificata dal nostro team'
    });
  } catch (error) {
    console.error('Errore segnalazione recensione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la segnalazione',
      error: error.message
    });
  }
};
