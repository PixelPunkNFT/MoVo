const express = require('express');
const router = express.Router();
const {
  getMyChats,
  getChatMessages,
  createChat,
  deleteChat,
  archiveChat,
  unarchiveChat
} = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Tutte le routes richiedono autenticazione
router.use(protect);

router.get('/', getMyChats);
router.post('/create', createChat);
router.get('/:chatId/messages', getChatMessages);
router.put('/:chatId/archive', archiveChat);
router.put('/:chatId/unarchive', unarchiveChat);
router.delete('/:chatId', deleteChat);

module.exports = router;
