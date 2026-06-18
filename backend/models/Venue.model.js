const mongoose = require('mongoose');

const VenueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Il nome del locale è obbligatorio'],
    unique: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'L\'indirizzo è obbligatorio'],
    trim: true
  },
  city: {
    type: String,
    default: 'Roma',
    trim: true
  },
  type: {
    type: String,
    default: 'Club Latino'
  },
  music: [{
    type: String,
    enum: ['salsa', 'bachata', 'reggaeton', 'merengue', 'kizomba', 'latin pop', 'latino', 'altro']
  }],
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [12.4964, 41.9028]
    }
  },
  description: {
    type: String,
    maxlength: 500
  },
  website: String,
  phone: String,
  image: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

VenueSchema.index({ 'location': '2dsphere' });

module.exports = mongoose.model('Venue', VenueSchema);
