const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utente è obbligatorio']
    },
    resale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resale',
      required: [true, 'Il biglietto è obbligatorio']
    }
  },
  {
    timestamps: true
  }
);

FavoriteSchema.index({ user: 1, resale: 1 }, { unique: true });

module.exports = mongoose.model('Favorite', FavoriteSchema);
