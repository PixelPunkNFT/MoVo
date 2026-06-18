const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utente è obbligatorio']
    },
    type: {
      type: String,
      enum: ['new_resale', 'event_soon', 'new_review', 'price_change', 'resale_sold', 'report_update', 'new_message', 'ride_imminent'],
      required: [true, 'Il tipo di notifica è obbligatorio']
    },
    title: {
      type: String,
      required: [true, 'Il titolo è obbligatorio'],
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    data: {
      type: Object
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

NotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
