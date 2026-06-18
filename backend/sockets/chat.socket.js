const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');
const Notification = require('../models/Notification.model');
const { onlineUsers, setIO } = require('./socketState');

// Inizializza Socket.IO
exports.initializeSocket = (io) => {
  setIO(io);
  // Middleware per autenticazione socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Token mancante'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return next(new Error('Utente non trovato'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Autenticazione fallita'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Utente connesso: ${socket.user.firstName} (${socket.userId})`);

    // Aggiungi utente agli online
    onlineUsers.set(socket.userId, socket.id);

    // Aggiorna stato online nel database
    User.findByIdAndUpdate(socket.userId, {
      isOnline: true,
      lastSeen: new Date()
    }).exec();

    // Notifica tutti gli utenti online
    io.emit('user:online', { userId: socket.userId });

    // Join alle chat dell'utente
    socket.on('chat:join', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat || (!chat.isPublic && !chat.participants.includes(socket.userId))) {
          socket.emit('error', { message: 'Chat non trovata o non autorizzato' });
          return;
        }

        socket.join(chatId);
        console.log(`User ${socket.userId} joined chat ${chatId}`);
        
        // Notifica che l'utente ha aperto la chat
        socket.to(chatId).emit('user:opened-chat', {
          userId: socket.userId,
          chatId
        });
      } catch (error) {
        console.error('Errore join chat:', error);
        socket.emit('error', { message: 'Errore durante il join della chat' });
      }
    });

    // Leave chat
    socket.on('chat:leave', (chatId) => {
      socket.leave(chatId);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // Invio messaggio
    socket.on('message:send', async (data) => {
      try {
        const { chatId, content, messageType, media, location, replyTo } = data;

        // Verifica che l'utente sia partecipante o chat pubblica
        const chat = await Chat.findById(chatId);
        
        if (!chat || (!chat.isPublic && !chat.participants.includes(socket.userId))) {
          socket.emit('error', { message: 'Non autorizzato a inviare messaggi in questa chat' });
          return;
        }

        // Crea messaggio
        const message = await Message.create({
          chat: chatId,
          sender: socket.userId,
          content,
          messageType: messageType || 'text',
          media,
          location,
          replyTo,
          delivered: true,
          deliveredAt: new Date()
        });

        await message.populate('sender', 'firstName lastName profilePhoto');

        // Invia messaggio a tutti nella chat
        io.to(chatId).emit('message:new', {
          message,
          chatId
        });

        // Invia aggiornamento conteggi non letti a tutti i partecipanti
        const updatedChat = await Chat.findById(chatId).select('unreadCount participants');
        io.to(chatId).emit('chat:unread-update', {
          chatId,
          unreadCount: updatedChat.unreadCount
        });

        // Notifica push e crea notifiche per gli altri partecipanti
        const otherParticipants = chat.participants.filter(
          p => p.toString() !== socket.userId
        );

        otherParticipants.forEach(async participantId => {
          const pid = participantId.toString();
          if (!onlineUsers.has(pid)) {
            console.log(`📬 Invia notifica push a ${pid}`);
          }
          try {
            await Notification.create({
              user: pid,
              type: 'new_message',
              title: `Nuovo messaggio da ${socket.user.firstName}`,
              message: content.substring(0, 100),
              data: { chatId, senderId: socket.userId }
            });
          } catch (notifErr) {
            console.error('Errore creazione notifica:', notifErr);
          }
        });

      } catch (error) {
        console.error('Errore invio messaggio:', error);
        socket.emit('error', { message: 'Errore durante l\'invio del messaggio' });
      }
    });

    // Typing indicator
    socket.on('typing:start', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat || (!chat.isPublic && !chat.participants.includes(socket.userId))) {
          return;
        }

        // Aggiorna typing status
        const typingUser = chat.typing.find(t => t.user.toString() === socket.userId);
        if (typingUser) {
          typingUser.isTyping = true;
        } else {
          chat.typing.push({ user: socket.userId, isTyping: true });
        }
        await chat.save();

        // Notifica gli altri utenti
        socket.to(chatId).emit('typing:update', {
          userId: socket.userId,
          isTyping: true,
          chatId
        });
      } catch (error) {
        console.error('Errore typing start:', error);
      }
    });

    socket.on('typing:stop', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        
        if (!chat || (!chat.isPublic && !chat.participants.includes(socket.userId))) {
          return;
        }

        // Aggiorna typing status
        const typingUser = chat.typing.find(t => t.user.toString() === socket.userId);
        if (typingUser) {
          typingUser.isTyping = false;
        }
        await chat.save();

        // Notifica gli altri utenti
        socket.to(chatId).emit('typing:update', {
          userId: socket.userId,
          isTyping: false,
          chatId
        });
      } catch (error) {
        console.error('Errore typing stop:', error);
      }
    });

    // Segna messaggio come letto
    socket.on('message:read', async (data) => {
      try {
        const { messageId, chatId } = data;

        const message = await Message.findById(messageId);
        
        if (!message) {
          return;
        }

        await message.markAsRead(socket.userId);

        // Notifica il mittente
        if (onlineUsers.has(message.sender.toString())) {
          const senderSocketId = onlineUsers.get(message.sender.toString());
          io.to(senderSocketId).emit('message:read-receipt', {
            messageId,
            readBy: socket.userId,
            chatId
          });
        }
      } catch (error) {
        console.error('Errore message read:', error);
      }
    });

    // Disconnessione
    socket.on('disconnect', async () => {
      console.log(`❌ Utente disconnesso: ${socket.user.firstName} (${socket.userId})`);

      // Rimuovi utente dagli online
      onlineUsers.delete(socket.userId);

      // Aggiorna stato offline nel database
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date()
      });

      // Notifica tutti gli utenti
      io.emit('user:offline', {
        userId: socket.userId,
        lastSeen: new Date()
      });
    });
  });

  console.log('🔌 Socket.IO inizializzato correttamente');
};

// Esporta funzione per ottenere utenti online
exports.getOnlineUsers = () => {
  return Array.from(onlineUsers.keys());
};
