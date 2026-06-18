const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Il viaggio è obbligatorio']
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il passeggero è obbligatorio']
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il conducente è obbligatorio']
    },
    // Dettagli prenotazione
    seatsBooked: {
      type: Number,
      required: [true, 'Il numero di posti è obbligatorio'],
      min: [1, 'Devi prenotare almeno 1 posto'],
      max: [4, 'Non puoi prenotare più di 4 posti']
    },
    totalPrice: {
      type: Number,
      required: [true, 'Il prezzo totale è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo']
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'confermato', 'rifiutato', 'cancellato', 'completato'],
      default: 'pending'
    },
    // Pagamento
    paymentStatus: {
      type: String,
      enum: ['pending', 'pagato', 'rimborsato', 'fallito'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['contanti', 'carta', 'paypal', 'satispay', 'bonifico'],
      default: 'contanti'
    },
    paymentDate: Date,
    // Note del passeggero
    passengerNote: {
      type: String,
      maxlength: [300, 'La nota non può superare 300 caratteri']
    },
    // Pick-up personalizzato
    customPickupLocation: {
      address: String,
      location: {
        type: {
          type: String,
          enum: ['Point']
        },
        coordinates: [Number]
      }
    },
    // Telefono di contatto (opzionale, diverso dal profilo)
    contactPhone: String,
    // Cancellazione
    cancellationReason: String,
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    // Review (se lasciata)
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    },
    // Notifiche
    notificationsSent: {
      bookingConfirmation: { type: Boolean, default: false },
      reminderSent: { type: Boolean, default: false },
      driverOnWay: { type: Boolean, default: false },
      tripCompleted: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual per controllare se la prenotazione è modificabile
BookingSchema.virtual('canModify').get(function () {
  return this.status === 'pending' || this.status === 'confermato';
});

// Virtual per controllare se è possibile cancellare
BookingSchema.virtual('canCancel').get(function () {
  return ['pending', 'confermato'].includes(this.status);
});

// Index per ricerche comuni
BookingSchema.index({ ride: 1 });
BookingSchema.index({ passenger: 1 });
BookingSchema.index({ driver: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ createdAt: -1 });

// Validazione: un utente non può prenotare il proprio viaggio
BookingSchema.pre('save', async function (next) {
  if (this.isNew) {
    const Ride = mongoose.model('Ride');
    const ride = await Ride.findById(this.ride);
    
    if (!ride) {
      return next(new Error('Viaggio non trovato'));
    }
    
    if (ride.driver.toString() === this.passenger.toString()) {
      return next(new Error('Non puoi prenotare il tuo stesso viaggio'));
    }
  }
  next();
});

// Metodo statico per ottenere statistiche prenotazioni
BookingSchema.statics.getBookingStats = async function (userId) {
  const stats = await this.aggregate([
    {
      $match: {
        passenger: new mongoose.Types.ObjectId(userId),
        status: 'completato'
      }
    },
    {
      $group: {
        _id: null,
        totalBookings: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        totalSeats: { $sum: '$seatsBooked' }
      }
    }
  ]);
  
  return stats.length > 0 ? stats[0] : { totalBookings: 0, totalSpent: 0, totalSeats: 0 };
};

module.exports = mongoose.model('Booking', BookingSchema);
