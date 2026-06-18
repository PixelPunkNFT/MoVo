const mongoose = require('mongoose');

const ResaleSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il venditore è obbligatorio']
    },
    eventName: {
      type: String,
      required: [true, 'Il nome dell\'evento è obbligatorio'],
      trim: true
    },
    category: {
      type: String,
      enum: ['salsa', 'bachata', 'kizomba', 'discoteca', 'concerto', 'festival', 'altro'],
      required: [true, 'La categoria è obbligatoria']
    },
    eventDate: {
      type: Date,
      required: [true, 'La data dell\'evento è obbligatoria']
    },
    eventTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato ora non valido (HH:MM)']
    },
    city: {
      type: String,
      required: [true, 'La città è obbligatoria'],
      trim: true
    },
    location: {
      type: String,
      trim: true
    },
    originalPrice: {
      type: Number,
      required: [true, 'Il prezzo originale è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo']
    },
    askingPrice: {
      type: Number,
      required: [true, 'Il prezzo richiesto è obbligatorio'],
      min: [0, 'Il prezzo non può essere negativo']
    },
    quantity: {
      type: Number,
      required: [true, 'La quantità è obbligatoria'],
      min: [1, 'La quantità minima è 1']
    },
    description: {
      type: String,
      maxlength: [1000, 'La descrizione non può superare 1000 caratteri'],
      trim: true
    },
    images: [String],
    status: {
      type: String,
      enum: ['active', 'sold', 'expired', 'cancelled'],
      default: 'active'
    },
    views: {
      type: Number,
      default: 0
    },
    contactCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    claimedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: Date
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

ResaleSchema.virtual('expiresInDays').get(function () {
  const now = new Date();
  const event = new Date(this.eventDate);
  const diffTime = event - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

ResaleSchema.virtual('isExpired').get(function () {
  return new Date(this.eventDate) < new Date();
});

ResaleSchema.virtual('discount').get(function () {
  if (this.originalPrice === 0) return 0;
  return ((this.originalPrice - this.askingPrice) / this.originalPrice * 100).toFixed(0);
});

ResaleSchema.index({ status: 1, eventDate: -1 });
ResaleSchema.index({ seller: 1 });
ResaleSchema.index({ category: 1, status: 1, eventDate: -1 });

module.exports = mongoose.model('Resale', ResaleSchema);
