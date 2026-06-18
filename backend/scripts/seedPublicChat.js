const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const Chat = require('../models/Chat.model');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const existing = await Chat.findOne({ isPublic: true });
    if (existing) {
      console.log('ℹ️ Chat pubblica già esistente:', existing._id);
      process.exit(0);
    }
    const chat = await Chat.create({
      chatType: 'public',
      isPublic: true,
      chatName: 'Chat Pubblica',
      participants: [],
      isActive: true,
    });
    console.log('✅ Chat pubblica creata:', chat._id);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Errore:', err.message);
    process.exit(1);
  });
