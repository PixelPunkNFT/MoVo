const Ride = require('../models/Ride.model');
const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const Chat = require('../models/Chat.model');
const { logAction } = require('../utils/logger');
const { notifyNearbyUsers } = require('../utils/notifyNearby');

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// @desc    Crea nuovo ride (RICHIEDE VEICOLO CON TARGA)
// @route   POST /api/rides
// @access  Private
exports.createRide = async (req, res) => {
  try {
    const {
      vehicleId,
      departure,
      destination,
      availableSeats,
      pricePerSeat,
      distance,
      estimatedDuration,
      preferences,
      notes,
      isRecurring,
      recurringDays,
      hasReturn,
      returnDateTime
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Devi verificare il tuo account per pubblicare passaggi. Vai sul profilo e verifica l\'email.'
      });
    }

    const vehicle = user.vehicles.id(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Veicolo non trovato. Devi prima aggiungere un veicolo.'
      });
    }

    // Crea il ride con i dati del veicolo (TARGA OBBLIGATORIA)
    const ride = await Ride.create({
      driver: req.user._id,
      vehicleId,
      plateNumber: vehicle.plateNumber,
      carBrand: vehicle.brand,
      carModel: vehicle.model,
      carColor: vehicle.color,
      carPhotos: vehicle.photos || [],
      departure,
      destination,
      availableSeats,
      pricePerSeat,
      distance,
      estimatedDuration,
      preferences,
      notes,
      isRecurring,
      recurringDays,
      hasReturn,
      returnDateTime
    });

    // Incrementa contatore rides come driver
    user.totalRidesAsDriver += 1;
    await user.save();

    await ride.populate('driver', 'firstName lastName profilePhoto rating totalReviews isPhoneVerified');
    notifyNearbyUsers(ride);

    logAction(req, 'create_ride', 'ride', 'Nuovo passaggio creato', { rideId: ride._id, destination: ride.destination?.name });

    res.status(201).json({
      success: true,
      message: 'Passaggio pubblicato con successo',
      data: { ride }
    });
  } catch (error) {
    console.error('Errore creazione ride:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione del passaggio',
      error: error.message
    });
  }
};

// @desc    Crea passaggio spontaneo (NO veicolo, NO prezzo)
// @route   POST /api/rides/spontaneous
// @access  Private
exports.createSpontaneousRide = async (req, res) => {
  try {
    const { destination, dateTime, availableSeats, notes } = req.body;

    const user = await User.findById(req.user._id);

    if (!user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: 'Devi verificare il tuo account per pubblicare passaggi.'
      });
    }

    // Default per i campi obbligatori del modello Ride
    const defaultLocation = { type: 'Point', coordinates: [12.4964, 41.9028] };

    const ride = await Ride.create({
      driver: req.user._id,
      spontaneous: true,
      vehicleId: 'spontaneous',
      plateNumber: 'SP000TN',
      carBrand: '--',
      carModel: '--',
      carColor: '--',
      departure: {
        address: 'Da concordare',
        city: 'Roma',
        location: defaultLocation,
        dateTime: dateTime || new Date()
      },
      destination: {
        name: destination?.name || 'Da definire',
        address: destination?.address || '',
        city: destination?.city || 'Roma',
        location: destination?.location || defaultLocation
      },
      pricePerSeat: 0,
      distance: 0,
      estimatedDuration: 30,
      availableSeats: availableSeats || 3,
      notes: notes || ''
    });

    await ride.populate('driver', 'firstName lastName profilePhoto rating totalReviews isPhoneVerified');
    notifyNearbyUsers(ride);

    logAction(req, 'create_spontaneous_ride', 'ride', 'Passaggio spontaneo creato', { rideId: ride._id, destination: ride.destination?.name });

    res.status(201).json({
      success: true,
      message: 'Passaggio spontaneo pubblicato!',
      data: { ride }
    });
  } catch (error) {
    console.error('Errore creazione ride spontaneo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione del passaggio spontaneo',
      error: error.message
    });
  }
};

// @desc    Unisciti a un passaggio spontaneo (booking + chat di gruppo)
// @route   POST /api/rides/:id/join
// @access  Private
exports.joinSpontaneousRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Passaggio non trovato' });
    }

    if (ride.status !== 'attivo') {
      return res.status(400).json({ success: false, message: 'Questo passaggio non è più disponibile' });
    }

    if (!ride.spontaneous) {
      return res.status(400).json({ success: false, message: 'Questo passaggio non è un passaggio spontaneo' });
    }

    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Sei già l\'autista di questo passaggio' });
    }

    if (ride.remainingSeats <= 0) {
      return res.status(400).json({ success: false, message: 'Posti esauriti' });
    }

    const existingBooking = await Booking.findOne({
      ride: ride._id,
      passenger: req.user._id,
      status: { $in: ['pending', 'confermato'] }
    });

    if (existingBooking) {
      return res.status(400).json({ success: false, message: 'Fai già parte di questo gruppo' });
    }

    // Crea booking con prezzo 0
    const booking = await Booking.create({
      ride: ride._id,
      passenger: req.user._id,
      driver: ride.driver,
      seatsBooked: 1,
      totalPrice: 0
    });

    ride.bookedSeats += 1;
    ride.bookings.push(booking._id);
    await ride.save();

    // Cerca o crea chat di gruppo per questo ride
    let chat = await Chat.findOne({ ride: ride._id, chatType: 'ride-group' });

    if (!chat) {
      chat = await Chat.create({
        participants: [ride.driver, req.user._id],
        ride: ride._id,
        booking: booking._id,
        chatType: 'ride-group',
        chatName: `⚡ Gruppo: ${ride.destination?.name || 'Passaggio'}`,
        unreadCount: [
          { user: ride.driver, count: 0 },
          { user: req.user._id, count: 0 }
        ]
      });
    } else {
      const alreadyInChat = chat.participants.some(p => p.toString() === req.user._id.toString());
      if (!alreadyInChat) {
        chat.participants.push(req.user._id);
        chat.unreadCount.push({ user: req.user._id, count: 0 });
        await chat.save();
      }
    }

    await Promise.all([
      booking.populate('passenger', 'firstName lastName profilePhoto rating'),
      chat.populate('participants', 'firstName lastName profilePhoto')
    ]);

    logAction(req, 'join_spontaneous_ride', 'ride', 'Utente si è unito a passaggio spontaneo', { rideId: ride._id, bookingId: booking._id });

    res.json({
      success: true,
      message: 'Ti sei unito al gruppo!',
      data: { booking, chat }
    });
  } catch (error) {
    console.error('Errore join ride spontaneo:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'iscrizione',
      error: error.message
    });
  }
};

// @desc    Cerca rides
// @route   GET /api/rides/search
// @access  Public
exports.searchRides = async (req, res) => {
  try {
    const {
      departureCity,
      destinationName,
      date,
      seats,
      maxPrice,
      musicType,
      smokingAllowed,
      spontaneous,
      page = 1,
      limit = 10
    } = req.query;

    const query = { status: 'attivo' };

    // Filtri
    if (departureCity) {
      query['departure.city'] = new RegExp(escapeRegex(departureCity), 'i');
    }

    if (destinationName && destinationName.trim()) {
      const escaped = escapeRegex(destinationName.trim());
      query.$or = [
        { 'destination.name': new RegExp(escaped, 'i') },
        { destination: new RegExp(escaped, 'i') }
      ];
    }

    if (spontaneous !== undefined) {
      query.spontaneous = spontaneous === 'true';
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query['departure.dateTime'] = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (seats) {
      query.bookedSeats = { $lte: parseInt(seats) };
    }

    if (maxPrice) {
      query.pricePerSeat = { $lte: parseFloat(maxPrice) };
    }

    if (musicType) {
      query['preferences.musicType'] = musicType;
    }

    if (smokingAllowed !== undefined) {
      query['preferences.smokingAllowed'] = smokingAllowed === 'true';
    }

    const rides = await Ride.find(query)
      .populate('driver', 'firstName lastName profilePhoto rating totalReviews preferences isPhoneVerified')
      .sort({ 'departure.dateTime': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Ride.countDocuments(query);

    res.json({
      success: true,
      data: {
        rides,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Errore ricerca rides:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la ricerca dei passaggi',
      error: error.message
    });
  }
};

// @desc    Get ride per ID
// @route   GET /api/rides/:id
// @access  Public
exports.getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('driver', 'firstName lastName profilePhoto rating totalReviews phone preferences socialLinks isPhoneVerified')
      .populate({
        path: 'bookings',
        populate: {
          path: 'passenger',
          select: 'firstName lastName profilePhoto rating'
        }
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Passaggio non trovato'
      });
    }

    // Incrementa views
    ride.views += 1;
    await ride.save();

    res.json({
      success: true,
      data: { ride }
    });
  } catch (error) {
    console.error('Errore get ride:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero del passaggio',
      error: error.message
    });
  }
};

// @desc    Get rides dell'utente come driver
// @route   GET /api/rides/my-rides/driver
// @access  Private
exports.getMyRidesAsDriver = async (req, res) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .populate({
        path: 'bookings',
        populate: {
          path: 'passenger',
          select: 'firstName lastName profilePhoto rating phone'
        }
      })
      .sort({ 'departure.dateTime': -1 });

    res.json({
      success: true,
      data: { rides }
    });
  } catch (error) {
    console.error('Errore get my rides as driver:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei tuoi passaggi',
      error: error.message
    });
  }
};

// @desc    Aggiorna ride
// @route   PUT /api/rides/:id
// @access  Private
exports.updateRide = async (req, res) => {
  try {
    let ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Passaggio non trovato'
      });
    }

    // Verifica che l'utente sia il driver
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a modificare questo passaggio'
      });
    }

    // Campi aggiornabili
    const allowedFields = ['departure', 'destination', 'availableSeats', 'pricePerSeat', 'preferences', 'notes'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    ride = await Ride.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Passaggio aggiornato con successo',
      data: { ride }
    });
  } catch (error) {
    console.error('Errore aggiornamento ride:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'aggiornamento del passaggio',
      error: error.message
    });
  }
};

// @desc    Cancella ride
// @route   DELETE /api/rides/:id
// @access  Private
exports.cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Passaggio non trovato'
      });
    }

    // Verifica che l'utente sia il driver
    if (ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato a cancellare questo passaggio'
      });
    }

    ride.status = 'cancellato';
    await ride.save();

    // Cancella tutte le prenotazioni associate
    await Booking.updateMany(
      { ride: ride._id, status: { $in: ['pending', 'confermato'] } },
      { status: 'cancellato', cancellationReason: 'Passaggio cancellato dal driver' }
    );

    logAction(req, 'cancel_ride', 'ride', 'Passaggio cancellato', { rideId: req.params.id });

    res.json({
      success: true,
      message: 'Passaggio cancellato con successo'
    });
  } catch (error) {
    console.error('Errore cancellazione ride:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la cancellazione del passaggio',
      error: error.message
    });
  }
};
