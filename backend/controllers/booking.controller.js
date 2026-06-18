const Booking = require('../models/Booking.model');
const Ride = require('../models/Ride.model');
const User = require('../models/User.model');
const { logAction } = require('../utils/logger');

// @desc    Prenota un ride
// @route   POST /api/bookings/:rideId
// @access  Private
exports.bookRide = async (req, res) => {
  try {
    const { seatsBooked, passengerNote, customPickupLocation, contactPhone } = req.body;
    const { rideId } = req.params;

    const ride = await Ride.findById(rideId);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Passaggio non trovato'
      });
    }

    // Controlla se il ride è attivo
    if (ride.status !== 'attivo') {
      return res.status(400).json({
        success: false,
        message: 'Questo passaggio non è più disponibile'
      });
    }

    // Controlla se l'utente sta provando a prenotare il proprio ride
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi prenotare il tuo stesso passaggio'
      });
    }

    // Controlla se ci sono abbastanza posti
    if (ride.bookedSeats + seatsBooked > ride.availableSeats) {
      return res.status(400).json({
        success: false,
        message: `Solo ${ride.remainingSeats} posti disponibili`
      });
    }

    // Controlla se l'utente ha già prenotato questo ride
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
      status: { $in: ['pending', 'confermato'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Hai già prenotato questo passaggio'
      });
    }

    // Calcola prezzo totale
    const totalPrice = ride.pricePerSeat * seatsBooked;

    // Crea booking
    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id,
      driver: ride.driver,
      seatsBooked,
      totalPrice,
      passengerNote,
      customPickupLocation,
      contactPhone: contactPhone || req.user.phone
    });

    // Aggiorna posti prenotati nel ride
    ride.bookedSeats += seatsBooked;
    ride.bookings.push(booking._id);
    await ride.save();

    await booking.populate([
      { path: 'passenger', select: 'firstName lastName profilePhoto rating phone' },
      { path: 'driver', select: 'firstName lastName profilePhoto' },
      { path: 'ride', select: 'departure destination plateNumber carBrand carModel carColor' }
    ]);

    logAction(req, 'create_booking', 'booking', 'Nuova prenotazione', { bookingId: booking._id, rideId: req.params.rideId });

    res.status(201).json({
      success: true,
      message: 'Prenotazione effettuata con successo',
      data: { booking }
    });
  } catch (error) {
    console.error('Errore prenotazione ride:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la prenotazione',
      error: error.message
    });
  }
};

// @desc    Get prenotazioni dell'utente come passeggero
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate('driver', 'firstName lastName profilePhoto rating phone isPhoneVerified')
      .populate('ride')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    console.error('Errore get my bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle prenotazioni',
      error: error.message
    });
  }
};

// @desc    Get prenotazioni ricevute come driver
// @route   GET /api/bookings/received
// @access  Private
exports.getReceivedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ driver: req.user._id })
      .populate('passenger', 'firstName lastName profilePhoto rating phone isPhoneVerified')
      .populate('ride')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bookings }
    });
  } catch (error) {
    console.error('Errore get received bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle prenotazioni ricevute',
      error: error.message
    });
  }
};

// @desc    Conferma prenotazione (driver)
// @route   PUT /api/bookings/:id/confirm
// @access  Private
exports.confirmBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Prenotazione non trovata'
      });
    }

    // Verifica che l'utente sia il driver
    if (booking.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'La prenotazione non è in stato pending'
      });
    }

    booking.status = 'confermato';
    await booking.save();

    res.json({
      success: true,
      message: 'Prenotazione confermata',
      data: { booking }
    });
  } catch (error) {
    console.error('Errore conferma booking:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la conferma',
      error: error.message
    });
  }
};

// @desc    Rifiuta prenotazione (driver)
// @route   PUT /api/bookings/:id/reject
// @access  Private
exports.rejectBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Prenotazione non trovata'
      });
    }

    // Verifica che l'utente sia il driver
    if (booking.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    booking.status = 'rifiutato';
    booking.cancellationReason = reason;
    await booking.save();

    // Rimuovi i posti dal ride
    const ride = await Ride.findById(booking.ride);
    if (ride) {
      ride.bookedSeats -= booking.seatsBooked;
      await ride.save();
    }

    res.json({
      success: true,
      message: 'Prenotazione rifiutata',
      data: { booking }
    });
  } catch (error) {
    console.error('Errore rifiuto booking:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il rifiuto',
      error: error.message
    });
  }
};

// @desc    Cancella prenotazione (passeggero)
// @route   DELETE /api/bookings/:id
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Prenotazione non trovata'
      });
    }

    // Verifica che l'utente sia il passeggero
    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    if (!booking.canCancel) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi cancellare questa prenotazione'
      });
    }

    booking.status = 'cancellato';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    booking.cancelledAt = new Date();
    await booking.save();

    // Rimuovi i posti dal ride
    const ride = await Ride.findById(booking.ride);
    if (ride) {
      ride.bookedSeats -= booking.seatsBooked;
      await ride.save();
    }

    logAction(req, 'cancel_booking', 'booking', 'Prenotazione cancellata', { bookingId: req.params.id });

    res.json({
      success: true,
      message: 'Prenotazione cancellata',
      data: { booking }
    });
  } catch (error) {
    console.error('Errore cancellazione booking:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la cancellazione',
      error: error.message
    });
  }
};

// @desc    Completa prenotazione
// @route   PUT /api/bookings/:id/complete
// @access  Private
exports.completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Prenotazione non trovata'
      });
    }

    // Driver o passeggero possono completare
    const isDriver = booking.driver.toString() === req.user._id.toString();
    const isPassenger = booking.passenger.toString() === req.user._id.toString();

    if (!isDriver && !isPassenger) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    if (booking.status !== 'confermato') {
      return res.status(400).json({
        success: false,
        message: 'La prenotazione deve essere confermata per essere completata'
      });
    }

    booking.status = 'completato';
    await booking.save();

    // Incrementa contatori
    await User.findByIdAndUpdate(booking.passenger, {
      $inc: { totalRidesAsPassenger: 1 }
    });
    await User.findByIdAndUpdate(booking.driver, {
      $inc: { totalRidesAsDriver: 1 }
    });

    res.json({
      success: true,
      message: 'Viaggio completato con successo',
      data: { booking }
    });
  } catch (error) {
    console.error('Errore completamento booking:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il completamento',
      error: error.message
    });
  }
};
