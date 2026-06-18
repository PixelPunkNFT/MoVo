const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il segnalatore è obbligatorio']
    },
    targetType: {
      type: String,
      enum: ['resale', 'user'],
      required: [true, 'Il tipo di target è obbligatorio']
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Il target è obbligatorio']
    },
    reason: {
      type: String,
      required: [true, 'La motivazione è obbligatoria'],
      maxlength: [500, 'La motivazione non può superare 500 caratteri'],
      trim: true
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Report', ReportSchema);
