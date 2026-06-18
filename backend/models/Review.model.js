const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Il viaggio è obbligatorio']
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'La prenotazione è obbligatoria']
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il recensore è obbligatorio']
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utente recensito è obbligatorio']
    },
    // Tipo di recensione
    reviewType: {
      type: String,
      enum: ['driver', 'passenger'],
      required: [true, 'Il tipo di recensione è obbligatorio']
    },
    // Rating generale
    overallRating: {
      type: Number,
      required: [true, 'Il rating generale è obbligatorio'],
      min: [1, 'Il rating minimo è 1'],
      max: [5, 'Il rating massimo è 5']
    },
    // Rating specifici
    ratings: {
      punctuality: {
        type: Number,
        min: 1,
        max: 5
      },
      cleanliness: {
        type: Number,
        min: 1,
        max: 5
      },
      communication: {
        type: Number,
        min: 1,
        max: 5
      },
      driving: {
        type: Number, // Solo per driver
        min: 1,
        max: 5
      },
      behavior: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    // Commento
    comment: {
      type: String,
      maxlength: [500, 'Il commento non può superare 500 caratteri'],
      trim: true
    },
    // Badge positivi
    positiveTags: [{
      type: String,
      enum: [
        'puntuale',
        'cordiale',
        'buon-guidatore',
        'auto-pulita',
        'buona-musica',
        'conversazione-piacevole',
        'rispettoso',
        'flessibile',
        'divertente'
      ]
    }],
    // Badge negativi
    negativeTags: [{
      type: String,
      enum: [
        'in-ritardo',
        'guida-pericolosa',
        'auto-sporca',
        'maleducato',
        'musica-troppo-alta',
        'troppo-invadente',
        'fumatore',
        'non-rispetta-accordi'
      ]
    }],
    // Status
    isVisible: {
      type: Boolean,
      default: true
    },
    // Risposta alla recensione
    response: {
      text: String,
      createdAt: Date
    },
    // Segnalazione inappropriata
    reported: {
      type: Boolean,
      default: false
    },
    reportReason: String,
    reportedAt: Date
  },
  {
    timestamps: true
  }
);

// Index per ricerche comuni
ReviewSchema.index({ reviewee: 1, isVisible: 1 });
ReviewSchema.index({ reviewer: 1 });
ReviewSchema.index({ ride: 1 });
ReviewSchema.index({ booking: 1 });

// Validazione: non puoi recensire te stesso
ReviewSchema.pre('save', function (next) {
  if (this.reviewer.toString() === this.reviewee.toString()) {
    return next(new Error('Non puoi recensire te stesso'));
  }
  next();
});

// Validazione: una sola recensione per prenotazione
ReviewSchema.index({ booking: 1, reviewer: 1 }, { unique: true });

// Metodo statico per calcolare il rating medio di un utente
ReviewSchema.statics.calculateAverageRating = async function (userId) {
  const result = await this.aggregate([
    {
      $match: {
        reviewee: new mongoose.Types.ObjectId(userId),
        isVisible: true
      }
    },
    {
      $group: {
        _id: '$reviewee',
        averageRating: { $avg: '$overallRating' },
        totalReviews: { $sum: 1 },
        averagePunctuality: { $avg: '$ratings.punctuality' },
        averageCleanliness: { $avg: '$ratings.cleanliness' },
        averageCommunication: { $avg: '$ratings.communication' },
        averageBehavior: { $avg: '$ratings.behavior' }
      }
    }
  ]);
  
  if (result.length > 0) {
    const User = mongoose.model('User');
    await User.findByIdAndUpdate(userId, {
      rating: Math.round(result[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: result[0].totalReviews
    });
  }
  
  return result.length > 0 ? result[0] : null;
};

// Dopo aver salvato una recensione, aggiorna il rating dell'utente
ReviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.reviewee);
});

module.exports = mongoose.model('Review', ReviewSchema);
