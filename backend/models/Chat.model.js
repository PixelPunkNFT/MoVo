const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema(
  {
    // Partecipanti della chat
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }],
    // Ride associato (opzionale)
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride'
    },
    // Booking associato (opzionale)
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    // Tipo di chat
    chatType: {
      type: String,
      enum: ['direct', 'ride-group', 'public'],
      default: 'direct'
    },
    // Chat pubblica (tutti gli utenti)
    isPublic: {
      type: Boolean,
      default: false
    },
    // Nome personalizzato per chat pubbliche
    chatName: {
      type: String,
      maxlength: 100
    },
    // Ultimo messaggio
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    lastMessageText: String,
    lastMessageTime: Date,
    // Messaggi non letti per utente
    unreadCount: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      count: {
        type: Number,
        default: 0
      }
    }],
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    // Archiviata da (utenti)
    archivedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    // Chi sta scrivendo
    typing: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      isTyping: {
        type: Boolean,
        default: false
      }
    }]
  },
  {
    timestamps: true
  }
);

// Index per ricerche veloci
ChatSchema.index({ participants: 1 });
ChatSchema.index({ ride: 1 });
ChatSchema.index({ lastMessageTime: -1 });

// Assicura che ci siano sempre 2 partecipanti per chat dirette
ChatSchema.pre('save', function (next) {
  if (this.chatType === 'direct' && this.participants.length !== 2) {
    return next(new Error('Una chat diretta deve avere esattamente 2 partecipanti'));
  }
  if (this.isPublic) {
    this.chatType = 'public';
  }
  next();
});

// Metodo per ottenere l'altro partecipante in una chat diretta
ChatSchema.methods.getOtherParticipant = function (userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

// Metodo per aumentare il contatore dei non letti
ChatSchema.methods.incrementUnread = function (userId) {
  const unread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (unread) {
    unread.count += 1;
  } else {
    this.unreadCount.push({ user: userId, count: 1 });
  }
  return this.save();
};

// Metodo per azzerare il contatore dei non letti
ChatSchema.methods.resetUnread = function (userId) {
  const unread = this.unreadCount.find(u => u.user.toString() === userId.toString());
  if (unread) {
    unread.count = 0;
  }
  return this.save();
};

// Metodo statico per trovare o creare una chat
ChatSchema.statics.findOrCreate = async function (participant1, participant2, rideId = null, bookingId = null) {
  // Cerca una chat esistente tra i due utenti
  let chat = await this.findOne({
    participants: { $all: [participant1, participant2] },
    chatType: 'direct'
  });
  
  // Se non esiste, creala
  if (!chat) {
    chat = await this.create({
      participants: [participant1, participant2],
      chatType: 'direct',
      ride: rideId,
      booking: bookingId,
      unreadCount: [
        { user: participant1, count: 0 },
        { user: participant2, count: 0 }
      ]
    });
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', ChatSchema);
