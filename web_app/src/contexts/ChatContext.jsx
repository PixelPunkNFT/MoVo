import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { chatService } from '../services/chatService';
import { getSocket } from '../services/socketService';
import { useAuth } from './AuthContext';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const { user } = useAuth();
  const socketRef = useRef(null);

  const totalChatUnread = chats.reduce((sum, chat) => {
    const entry = chat.unreadCount?.find(u => u.user === user?._id);
    return sum + (entry?.count || 0);
  }, 0);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    if (!socket || !user) return;

    const handleNewMessage = ({ message, chatId }) => {
      setMessages(prev => [...prev, message]);
      setChats(prev => prev.map(c => {
        if (c._id === chatId) {
          return { ...c, lastMessage: message, lastMessageText: message.content, lastMessageTime: message.createdAt };
        }
        return c;
      }));
    };

    const handleUnreadUpdate = ({ chatId, unreadCount }) => {
      setChats(prev => prev.map(c => {
        if (c._id === chatId) {
          return { ...c, unreadCount };
        }
        return c;
      }));
    };

    const handleTyping = ({ userId, isTyping, chatId }) => {
      if (chatId === activeChat?._id) {
        setTypingUsers(prev => ({ ...prev, [userId]: isTyping }));
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('chat:unread-update', handleUnreadUpdate);
    socket.on('message:read-receipt', ({ messageId, readBy }) => {
      setMessages(prev => prev.map(m =>
        m._id === messageId ? { ...m, readBy: [...(m.readBy || []), { user: readBy }] } : m
      ));
    });

    return () => {
      socket.off('message:new', handleNewMessage);
      socket.off('typing:update', handleTyping);
    };
  }, [user, activeChat]);

  const getMyChats = useCallback(async (archived = false) => {
    setLoading(true);
    try {
      const res = await chatService.getMyChats(archived ? { archived: 'true' } : {});
      setChats(res.data.chats);
    } finally { setLoading(false); }
  }, []);

  const getMessages = useCallback(async (chatId) => {
    setLoading(true);
    try {
      const res = await chatService.getMessages(chatId);
      setMessages(res.data.messages);
    } finally { setLoading(false); }
  }, []);

  const createChat = useCallback(async (userId, rideId = null) => {
    const res = await chatService.createChat({ userId, rideId });
    return res.data.chat;
  }, []);

  const sendMessage = useCallback((chatId, content, messageType = 'text') => {
    const socket = getSocket();
    if (socket) socket.emit('message:send', { chatId, content, messageType });
  }, []);

  const joinChat = useCallback((chatId) => {
    const socket = getSocket();
    if (socket) socket.emit('chat:join', chatId);
  }, []);

  const leaveChat = useCallback((chatId) => {
    const socket = getSocket();
    if (socket) socket.emit('chat:leave', chatId);
  }, []);

  const startTyping = useCallback((chatId) => {
    const socket = getSocket();
    if (socket) socket.emit('typing:start', chatId);
  }, []);

  const stopTyping = useCallback((chatId) => {
    const socket = getSocket();
    if (socket) socket.emit('typing:stop', chatId);
  }, []);

  const markAsRead = useCallback((messageId, chatId) => {
    const socket = getSocket();
    if (socket) socket.emit('message:read', { messageId, chatId });
  }, []);

  const deleteChat = useCallback(async (id) => {
    await chatService.deleteChat(id);
    setChats(prev => prev.filter(c => c._id !== id));
    if (activeChat?._id === id) { setActiveChat(null); setMessages([]); }
  }, [activeChat]);

  const archiveChat = useCallback(async (chatId) => {
    await chatService.archiveChat(chatId);
    setChats(prev => prev.filter(c => c._id !== chatId));
    if (activeChat?._id === chatId) { setActiveChat(null); setMessages([]); }
  }, [activeChat]);

  const unarchiveChat = useCallback(async (chatId) => {
    await chatService.unarchiveChat(chatId);
    setChats(prev => prev.filter(c => c._id !== chatId));
  }, []);

  return (
    <ChatContext.Provider value={{
      chats, messages, activeChat, loading, typingUsers, totalChatUnread,
      setActiveChat, getMyChats, getMessages, createChat,
      sendMessage, joinChat, leaveChat, startTyping, stopTyping,
      markAsRead, deleteChat, archiveChat, unarchiveChat
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChats = () => useContext(ChatContext);
