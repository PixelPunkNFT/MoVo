const mongoose = require('mongoose');

const ContactRequestSchema = new mongoose.Schema(
  {
    resale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resale',
      required: [true, 'Il biglietto è obbligatorio']
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'acquirente è obbligatorio']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il venditore è obbligatorio']
    },
    contactedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

ContactRequestSchema.index({ resale: 1, buyer: 1 });

module.exports = mongoose.model('ContactRequest', ContactRequestSchema);
