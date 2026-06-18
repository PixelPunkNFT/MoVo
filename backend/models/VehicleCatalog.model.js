const mongoose = require('mongoose');

const VehicleCatalogSchema = new mongoose.Schema({
  brand: {
    type: String,
    required: [true, 'La marca è obbligatoria'],
    trim: true,
    uppercase: true
  },
  model: {
    type: String,
    required: [true, 'Il modello è obbligatorio'],
    trim: true
  },
  yearStart: {
    type: Number,
    min: 1950
  },
  yearEnd: {
    type: Number,
    max: new Date().getFullYear() + 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

VehicleCatalogSchema.index({ brand: 1, model: 1 }, { unique: true });
VehicleCatalogSchema.index({ brand: 1 });

module.exports = mongoose.model('VehicleCatalog', VehicleCatalogSchema);
