const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il conducente è obbligatorio']
    },
    // VEICOLO OBBLIGATORIO
    vehicleId: {
      type: String,
      required: [true, 'Il veicolo è obbligatorio']
    },
    plateNumber: {
      type: String,
      required: [true, 'La targa è obbligatoria'],
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/, 'Formato targa non valido (es: AB123CD)']
    },
    carBrand: {
      type: String,
      required: [true, 'La marca dell\'auto è obbligatoria'],
      trim: true
    },
    carModel: {
      type: String,
      required: [true, 'Il modello dell\'auto è obbligatorio'],
      trim: true
    },
    carColor: {
      type: String,
      required: [true, 'Il colore dell\'auto è obbligatorio'],
      trim: true
    },
    carPhotos: [String],
    // Partenza
    departure: {
      address: {
        type: String,
        required: [true, 'L\'indirizzo di partenza è obbligatorio']
      },
      city: {
        type: String,
        required: true
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      },
      dateTime: {
        type: Date,
        required: [true, 'La data e ora di partenza sono obbligatorie']
      }
    },
    // Destinazione (locale latino)
    destination: {
      name: {
        type: String,
        required: [true, 'Il nome del locale è obbligatorio']
      },
      address: {
        type: String,
        default: ''
      },
      city: {
        type: String,
        required: true,
        default: 'Roma'
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          required: true,
          default: 'Point'
        },
        coordinates: {
          type: [Number], // [longitude, latitude]
          required: true
        }
      },
      estimatedArrival: Date
    },
    // Dettagli viaggio
    availableSeats: {
      type: Number,
      required: [true, 'I posti disponibili sono obbligatori'],
      min: [1, 'Deve esserci almeno 1 posto disponibile'],
      max: [8, 'Non più di 8 posti']
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: 0
    },
    pricePerSeat: {
      type: Number,
      required: [true, 'Il prezzo per posto è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo']
    },
    currency: {
      type: String,
      default: 'EUR'
    },
    distance: {
      type: Number, // in km
      required: true
    },
    estimatedDuration: {
      type: Number, // in minuti
      required: true
    },
    // Preferenze viaggio
    preferences: {
      musicType: {
        type: String,
        enum: ['salsa', 'bachata', 'reggaeton', 'merengue', 'kizomba', 'altro', 'nessuna'],
        default: 'nessuna'
      },
      smokingAllowed: {
        type: Boolean,
        default: false
      },
      petsAllowed: {
        type: Boolean,
        default: false
      },
      luggageAllowed: {
        type: Boolean,
        default: true
      },
      genderPreference: {
        type: String,
        enum: ['maschio', 'femmina', 'misto', 'nessuna-preferenza'],
        default: 'nessuna-preferenza'
      }
    },
    // Note aggiuntive
    notes: {
      type: String,
      maxlength: [500, 'Le note non possono superare 500 caratteri']
    },
    // Status
    status: {
      type: String,
      enum: ['attivo', 'completato', 'cancellato', 'in-corso'],
      default: 'attivo'
    },
    // Passaggio spontaneo (senza veicolo/prezzo)
    spontaneous: {
      type: Boolean,
      default: false
    },
    // Prenotazioni
    bookings: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }],
    // Metadati
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringDays: [{
      type: String,
      enum: ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica']
    }],
    views: {
      type: Number,
      default: 0
    },
    // Ritorno
    hasReturn: {
      type: Boolean,
      default: false
    },
    returnDateTime: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual per posti rimanenti
RideSchema.virtual('remainingSeats').get(function () {
  return this.availableSeats - this.bookedSeats;
});

// Virtual per controllare se il viaggio è pieno
RideSchema.virtual('isFull').get(function () {
  return this.bookedSeats >= this.availableSeats;
});

// Virtual per controllare se il viaggio è imminente (entro 2 ore)
RideSchema.virtual('isImminent').get(function () {
  if (!this.departure.dateTime) return false;
  const now = new Date();
  const departureTime = new Date(this.departure.dateTime);
  const hoursDiff = (departureTime - now) / (1000 * 60 * 60);
  return hoursDiff <= 2 && hoursDiff > 0;
});

// Geospatial index per ricerche per posizione
RideSchema.index({ 'departure.location': '2dsphere' });
RideSchema.index({ 'destination.location': '2dsphere' });

// Index per ricerche comuni
RideSchema.index({ driver: 1 });
RideSchema.index({ status: 1 });
RideSchema.index({ 'departure.dateTime': 1 });
RideSchema.index({ plateNumber: 1 });

// Validazione: la data di partenza deve essere nel futuro
RideSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('departure.dateTime')) {
    const now = new Date();
    if (this.departure.dateTime < now) {
      return next(new Error('La data di partenza deve essere nel futuro'));
    }
  }
  next();
});

// Validazione: bookedSeats non può superare availableSeats
RideSchema.pre('save', function (next) {
  if (this.bookedSeats > this.availableSeats) {
    return next(new Error('I posti prenotati non possono superare i posti disponibili'));
  }
  next();
});

module.exports = mongoose.model('Ride', RideSchema);
