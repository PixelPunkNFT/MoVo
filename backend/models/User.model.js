const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Il nome è obbligatorio'],
      trim: true,
      minlength: [2, 'Il nome deve essere almeno 2 caratteri'],
      maxlength: [50, 'Il nome non può superare 50 caratteri']
    },
    lastName: {
      type: String,
      required: [true, 'Il cognome è obbligatorio'],
      trim: true,
      minlength: [2, 'Il cognome deve essere almeno 2 caratteri'],
      maxlength: [50, 'Il cognome non può superare 50 caratteri']
    },
    email: {
      type: String,
      required: [true, 'L\'email è obbligatoria'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Inserisci un\'email valida'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Il telefono è obbligatorio'],
      match: [/^[+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im, 'Inserisci un numero di telefono valido']
    },
    password: {
      type: String,
      required: [true, 'La password è obbligatoria'],
      minlength: [6, 'La password deve essere almeno 6 caratteri'],
      select: false // Non restituire la password nelle query
    },
    profilePhoto: {
      type: String,
      default: 'https://res.cloudinary.com/default/image/upload/v1/default-avatar.png'
    },
    bio: {
      type: String,
      maxlength: [500, 'La bio non può superare 500 caratteri']
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'La data di nascita è obbligatoria']
    },
    gender: {
      type: String,
      enum: ['maschio', 'femmina', 'altro', 'preferisco-non-dirlo'],
      default: 'preferisco-non-dirlo'
    },
    // Veicoli dell'utente
    vehicles: [
      {
        plateNumber: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
          match: [/^[A-Z]{2}[0-9]{3}[A-Z]{2}$/, 'Formato targa non valido (es: AB123CD)']
        },
        brand: {
          type: String,
          required: true,
          trim: true
        },
        model: {
          type: String,
          required: true,
          trim: true
        },
        color: {
          type: String,
          required: true,
          trim: true
        },
        year: {
          type: Number,
          min: 1950,
          max: new Date().getFullYear() + 1
        },
        verified: {
          type: Boolean,
          default: false
        },
        photos: [String],
        isDefault: {
          type: Boolean,
          default: false
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    // Statistiche e rating
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    totalRidesAsDriver: {
      type: Number,
      default: 0
    },
    totalRidesAsPassenger: {
      type: Number,
      default: 0
    },
    // Ruolo utente
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    // Verifica account
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    isPhoneVerified: {
      type: Boolean,
      default: false
    },
    isIDVerified: {
      type: Boolean,
      default: false
    },
    nearbyAlerts: {
      type: Boolean,
      default: false
    },
    favoriteVenues: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue'
    }],
    lastLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    },
    resalesActive: {
      type: Number,
      default: 0
    },
    resalesSold: {
      type: Number,
      default: 0
    },
    resalesBought: {
      type: Number,
      default: 0
    },
    dailyResaleCount: {
      type: Number,
      default: 0
    },
    lastResaleDate: Date,
    // Preferenze
    preferences: {
      musicPreference: {
        type: String,
        enum: ['salsa', 'bachata', 'reggaeton', 'merengue', 'kizomba', 'altro', 'nessuna']
      },
      smokingAllowed: {
        type: Boolean,
        default: false
      },
      petsAllowed: {
        type: Boolean,
        default: false
      },
      chattiness: {
        type: String,
        enum: ['molto', 'medio', 'poco'],
        default: 'medio'
      }
    },
    // Social
    socialLinks: {
      instagram: String,
      facebook: String,
      tiktok: String
    },
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    // Password reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // FCM token per notifiche push
    fcmToken: String
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual per nome completo
UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual per età
UserSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Virtual per badge
UserSchema.virtual('badges').get(function () {
  const badges = [];
  if ((this.isPhoneVerified || this.isIDVerified) && this.totalRidesAsDriver >= 1) {
    badges.push('verified-driver');
  }
  if (this.totalReviews >= 3 && this.rating >= 4.5) {
    badges.push('punctual');
  }
  if (this.totalRidesAsDriver >= 10 && this.totalReviews >= 5 && this.rating >= 4.8) {
    badges.push('super-host');
  }
  if (this.preferences?.musicPreference && this.preferences.musicPreference !== 'nessuna') {
    badges.push('music-lover');
  }
  return badges;
});

// Encrypt password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password method
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ensure only one default vehicle
UserSchema.pre('save', function (next) {
  if (this.vehicles && this.vehicles.length > 0) {
    const defaultVehicles = this.vehicles.filter(v => v.isDefault);
    if (defaultVehicles.length > 1) {
      // Set only the first as default
      this.vehicles.forEach((v, index) => {
        v.isDefault = index === 0;
      });
    } else if (defaultVehicles.length === 0 && this.vehicles.length > 0) {
      // Set the first vehicle as default
      this.vehicles[0].isDefault = true;
    }
  }
  next();
});

// Index per ricerche veloci
UserSchema.index({ phone: 1 });
UserSchema.index({ 'vehicles.plateNumber': 1 });
UserSchema.index({ lastLocation: '2dsphere' });

module.exports = mongoose.model('User', UserSchema);
