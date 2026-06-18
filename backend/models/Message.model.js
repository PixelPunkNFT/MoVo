const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: [true, 'La chat è obbligatoria']
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Il mittente è obbligatorio']
    },
    // Tipo di messaggio
    messageType: {
      type: String,
      enum: ['text', 'image', 'location', 'system'],
      default: 'text'
    },
    // Contenuto
    content: {
      type: String,
      required: function() {
        return this.messageType === 'text' || this.messageType === 'system';
      },
      maxlength: [1000, 'Il messaggio non può superare 1000 caratteri']
    },
    // Media (per immagini)
    media: {
      url: String,
      type: String,
      thumbnail: String
    },
    // Posizione (per condivisione location)
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number],
      address: String
    },
    // Status di lettura
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Status di consegna
    delivered: {
      type: Boolean,
      default: false
    },
    deliveredAt: Date,
    // Messaggio eliminato
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    // Reply to (risposta a un altro messaggio)
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message'
    },
    // Metadati per messaggi di sistema
    systemMetadata: {
      action: String, // es: 'booking_confirmed', 'ride_cancelled', etc.
      data: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// Index per ricerche veloci
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

// Virtual per controllare se il messaggio è letto
MessageSchema.virtual('isRead').get(function () {
  return this.readBy && this.readBy.length > 0;
});

// Dopo aver salvato un messaggio, aggiorna la chat
MessageSchema.post('save', async function () {
  const Chat = mongoose.model('Chat');
  const chat = await Chat.findById(this.chat);
  
  if (chat) {
    chat.lastMessage = this._id;
    chat.lastMessageText = this.messageType === 'text' ? this.content : `[${this.messageType}]`;
    chat.lastMessageTime = this.createdAt;
    
    // Incrementa il contatore dei non letti per tutti tranne il mittente
    chat.participants.forEach(participantId => {
      if (participantId.toString() !== this.sender.toString()) {
        const unread = chat.unreadCount.find(u => u.user.toString() === participantId.toString());
        if (unread) {
          unread.count += 1;
        } else {
          chat.unreadCount.push({ user: participantId, count: 1 });
        }
      }
    });
    
    await chat.save();
  }
});

// Metodo per segnare come letto
MessageSchema.methods.markAsRead = async function (userId) {
  if (!this.readBy.find(r => r.user.toString() === userId.toString())) {
    this.readBy.push({ user: userId, readAt: new Date() });
    await this.save();
    
    // Azzera il contatore nella chat
    const Chat = mongoose.model('Chat');
    const chat = await Chat.findById(this.chat);
    if (chat) {
      await chat.resetUnread(userId);
    }
  }
};

module.exports = mongoose.model('Message', MessageSchema);
