const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utente è obbligatorio']
    },
    email: {
      type: String,
      required: [true, 'L\'email è obbligatoria']
    },
    code: {
      type: String,
      required: [true, 'Il codice è obbligatorio'],
      match: [/^\d{6}$/, 'Il codice deve essere di 6 cifre']
    },
    type: {
      type: String,
      enum: ['verification', 'password-reset'],
      default: 'verification'
    },
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 5 * 60 * 1000)
    },
    verified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

OtpSchema.index({ user: 1, type: 1 });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', OtpSchema);
