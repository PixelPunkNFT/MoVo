const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, 'Action è obbligatoria'],
    index: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['auth', 'user', 'ride', 'resale', 'booking', 'chat', 'otp', 'admin', 'system'],
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ip: String,
  userAgent: String,
  severity: {
    type: String,
    enum: ['info', 'warning', 'error'],
    default: 'info',
  },
}, {
  timestamps: true,
});

logSchema.index({ createdAt: -1 });
logSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Log', logSchema);
