const Chat = require('../models/Chat.model');
const Message = require('../models/Message.model');

// @desc    Get tutte le chat dell'utente
// @route   GET /api/chats
// @access  Private
exports.getMyChats = async (req, res) => {
  try {
    const { archived } = req.query;
    const isArchived = archived === 'true';

    const baseQuery = {
      $or: [
        { participants: req.user._id, isActive: true },
        { isPublic: true, isActive: true }
      ]
    };
    if (isArchived) {
      baseQuery.archivedBy = req.user._id;
    } else {
      baseQuery.archivedBy = { $ne: req.user._id };
    }

    const chats = await Chat.find(baseQuery)
      .populate('participants', 'firstName lastName profilePhoto isOnline lastSeen isPhoneVerified')
      .populate('lastMessage')
      .populate('ride', 'departure destination')
      .sort({ isPublic: -1, lastMessageTime: -1 });

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Errore get my chats:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero delle chat',
      error: error.message
    });
  }
};

// @desc    Get messaggi di una chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat non trovata'
      });
    }

    // Verifica accesso: partecipante o chat pubblica
    if (!chat.isPublic && !chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non sei partecipante di questa chat'
      });
    }

    const messages = await Message.find({
      chat: chatId,
      isDeleted: false
    })
      .populate('sender', 'firstName lastName profilePhoto')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Message.countDocuments({
      chat: chatId,
      isDeleted: false
    });

    // Segna i messaggi come letti
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: req.user._id },
        'readBy.user': { $ne: req.user._id }
      },
      {
        $push: {
          readBy: {
            user: req.user._id,
            readAt: new Date()
          }
        }
      }
    );

    // Azzera contatore non letti
    await chat.resetUnread(req.user._id);

    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Ordine cronologico
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count
      }
    });
  } catch (error) {
    console.error('Errore get chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Errore nel recupero dei messaggi',
      error: error.message
    });
  }
};

// @desc    Crea o ottieni chat con un utente
// @route   POST /api/chats/create
// @access  Private
exports.createChat = async (req, res) => {
  try {
    const { userId, rideId, bookingId } = req.body;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Non puoi creare una chat con te stesso'
      });
    }

    const chat = await Chat.findOrCreate(req.user._id, userId, rideId, bookingId);

    await chat.populate('participants', 'firstName lastName profilePhoto isOnline lastSeen isPhoneVerified');

    res.json({
      success: true,
      data: { chat }
    });
  } catch (error) {
    console.error('Errore create chat:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante la creazione della chat',
      error: error.message
    });
  }
};

// @desc    Elimina chat
// @route   DELETE /api/chats/:chatId
// @access  Private
exports.deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat non trovata'
      });
    }

    // Verifica che l'utente sia partecipante
    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Non autorizzato'
      });
    }

    chat.isActive = false;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat eliminata'
    });
  } catch (error) {
    console.error('Errore delete chat:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'eliminazione della chat',
      error: error.message
    });
  }
};

// @desc    Archivia chat
// @route   PUT /api/chats/:chatId/archive
// @access  Private
exports.archiveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat non trovata' });
    }

    if (!chat.participants.includes(req.user._id)) {
      return res.status(403).json({ success: false, message: 'Non autorizzato' });
    }

    if (!chat.archivedBy.includes(req.user._id)) {
      chat.archivedBy.push(req.user._id);
      await chat.save();
    }

    res.json({ success: true, message: 'Chat archiviata' });
  } catch (error) {
    console.error('Errore archive chat:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante l\'archiviazione',
      error: error.message
    });
  }
};

// @desc    Ripristina chat dall'archivio
// @route   PUT /api/chats/:chatId/unarchive
// @access  Private
exports.unarchiveChat = async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({ success: false, message: 'Chat non trovata' });
    }

    chat.archivedBy.pull(req.user._id);
    await chat.save();

    res.json({ success: true, message: 'Chat ripristinata' });
  } catch (error) {
    console.error('Errore unarchive chat:', error);
    res.status(500).json({
      success: false,
      message: 'Errore durante il ripristino',
      error: error.message
    });
  }
};
