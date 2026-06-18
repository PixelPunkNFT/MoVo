import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useChats } from '../../contexts/ChatContext';
import { colors } from '../../config/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import VerifiedBadge from '../../components/VerifiedBadge';

function ChatDetail({ chatId, chatName, chatType, onBack }) {
  const { messages, loading, getMessages, sendMessage, joinChat, leaveChat, startTyping, stopTyping, markAsRead, typingUsers, setActiveChat, archiveChat } = useChats();
  const { user } = useAuth();
  const [text, setText] = useState('');
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (chatId) { getMessages(chatId); joinChat(chatId); setActiveChat({ _id: chatId }); }
    return () => { if (chatId) leaveChat(chatId); };
  }, [chatId]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender?._id !== user?._id) markAsRead(lastMsg._id, chatId);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(chatId, text.trim());
    setText('');
    stopTyping(chatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
  };

  const handleTyping = (value) => {
    setText(value);
    startTyping(chatId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => stopTyping(chatId), 1000);
  };

  const isTyping = Object.values(typingUsers).some(v => v);

  if (loading) return <LoadingSpinner />;

  return (
    <div style={styles.chatContainer}>
      <div style={styles.chatHeader}>
        <button style={styles.backBtn} onClick={onBack}>← Indietro</button>
        <span style={{ fontWeight: 600 }}>{chatName || 'Chat'}</span>
        <button style={styles.archiveBtn} onClick={async () => { if (confirm('Archiviare questa chat?')) { await archiveChat(chatId); onBack(); } }}>📦</button>
      </div>
      <div style={styles.messagesContainer}>
        {messages.map(msg => {
          const isMe = msg.sender?._id === user?._id;
          return (
            <div key={msg._id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 8, alignItems: 'flex-end', gap: 6 }}>
          {!isMe && (
            <div style={{
              width: 28, height: 28, borderRadius: 14, flexShrink: 0,
              background: msg.sender?.profilePhoto && !msg.sender.profilePhoto.includes('default-avatar')
                ? `url(${msg.sender.profilePhoto}) center/cover`
                : colors.primary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: msg.sender?.profilePhoto && !msg.sender.profilePhoto.includes('default-avatar') ? 'transparent' : '#fff'
            }}>
              {(!msg.sender?.profilePhoto || msg.sender.profilePhoto.includes('default-avatar')) && (msg.sender?.firstName?.[0] || '?')}
            </div>
          )}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && <div style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 2, paddingLeft: 4 }}>{msg.sender?.firstName || 'Utente'}{msg.sender?.isPhoneVerified && <VerifiedBadge size={10} />}</div>}
                <div style={{ ...styles.messageBubble, background: isMe ? colors.primary : colors.surface }}>
                  <div style={{ fontSize: 14 }}>{msg.content}</div>
                  <div style={{ fontSize: 10, color: isMe ? '#ffffffcc' : colors.textHint, textAlign: 'right', marginTop: 4 }}>
                    {new Date(msg.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                    {isMe && msg.readBy?.length > 0 && ' ✓✓'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {isTyping && <div style={{ fontSize: 12, color: colors.textHint, padding: '4px 0' }}>Qualcuno sta scrivendo...</div>}
        <div ref={messagesEndRef} />
      </div>
      <div style={styles.inputBar}>
        <input style={styles.chatInput} value={text} onChange={e => handleTyping(e.target.value)} placeholder="Scrivi un messaggio..."
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} />
        <button style={styles.sendBtn} onClick={handleSend} disabled={!text.trim()}>➤</button>
      </div>
    </div>
  );
}

export default function ChatsPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { chats, getMyChats, unarchiveChat } = useChats();
  const [selectedChat, setSelectedChat] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (chatId) setSelectedChat({ _id: chatId });
  }, [chatId]);

  useEffect(() => {
    getMyChats(showArchived);
  }, [showArchived]);

  const handleSelect = (chat) => {
    setSelectedChat(chat);
    navigate(`/chats/${chat._id}`, { replace: true });
  };

  const handleBack = () => { setSelectedChat(null); navigate('/chats', { replace: true }); };

  if (selectedChat) return <ChatDetail chatId={selectedChat._id} chatName={selectedChat.chatName} chatType={selectedChat.chatType} onBack={handleBack} />;
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>{showArchived ? 'Archiviate' : 'Chat'}</h2>
        {!showArchived && (() => { const total = chats.reduce((s, c) => { const e = c.unreadCount?.find(u => u.user === user?._id); return s + (e?.count || 0); }, 0); return total > 0 ? <span style={{ background: colors.gold, color: '#0F1115', fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{total > 99 ? '99+' : total}</span> : null; })()}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <button style={{ background: 'none', border: `1px solid ${showArchived ? colors.gold : colors.textHint}44`, color: showArchived ? colors.gold : colors.textHint, fontSize: 12, padding: '6px 12px', borderRadius: 10, cursor: 'pointer' }}
            onClick={() => setShowArchived(!showArchived)}>
            {showArchived ? '← Chat' : `📦 ${chats.length > 0 ? chats.length : ''}`.trim()}
          </button>
        </div>
      </div>
      {showArchived && chats.length > 0 && <p style={{ fontSize: 12, color: colors.textHint, marginBottom: 8 }}>Tocca una chat per ripristinarla</p>}
      <div>
        {chats.length === 0 && <p style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 40 }}>{showArchived ? 'Nessuna chat archiviata' : 'Nessuna chat'}</p>}
        {chats.map(chat => (
          <div key={chat._id} style={{ display: 'flex', alignItems: 'center', gap: 8, ...styles.chatItem, background: chatId === chat._id ? colors.surface : 'transparent' }} onClick={() => showArchived ? (async () => { await unarchiveChat(chat._id); getMyChats(true); })() : handleSelect(chat)}>
            <div style={{
              width: 44, height: 44, borderRadius: 22, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
              background: chat.chatType === 'ride-group'
                ? '#D4AF3722'
                : (chat.isPublic ? '#1DA1F2' : colors.primary),
              display: 'flex', fontSize: chat.chatType === 'ride-group' ? 20 : 18, fontWeight: 700, color: '#fff',
            }}>
              {chat.chatType === 'ride-group' ? '👥' : (chat.isPublic ? '#' : '?')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {chat.chatType === 'ride-group' ? chat.chatName : (chat.isPublic ? 'Chat Pubblica' : (() => { const o = chat.participants?.find(p => p._id !== user?._id); return o ? `${o.firstName} ${o.lastName}` : 'Chat'; })())}
                  {(() => { const u = chat.unreadCount?.find(e => e.user === user?._id); return u?.count > 0 && !showArchived ? <span style={{ marginLeft: 6, background: colors.gold, color: '#0F1115', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8 }}>{u.count}</span> : null; })()}
                </span>
                <span style={{ fontSize: 11, color: colors.textHint }}>
                  {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString('it-IT') : ''}
                </span>
              </div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                {chat.lastMessageText || (chat.chatType === 'ride-group' ? `${chat.participants?.length || 0} partecipanti` : (chat.isPublic ? 'Tutti possono scrivere qui' : 'Inizia una conversazione'))}
              </div>
            </div>
            {showArchived && <span style={{ fontSize: 11, color: colors.gold }}>Ripristina ›</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  chatItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', cursor: 'pointer', borderBottom: `1px solid ${colors.textHint}11` },
  chatContainer: { display: 'flex', flexDirection: 'column', height: 'calc(100vh - 140px)' },
  chatHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' },
  backBtn: { background: 'none', border: 'none', color: colors.primary, cursor: 'pointer', fontSize: 14 },
  archiveBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '4px 8px' },
  messagesContainer: { flex: 1, overflowY: 'auto', padding: '8px 0' },
  messageBubble: { maxWidth: '80%', padding: '10px 14px', borderRadius: 16, borderBottomLeftRadius: 4 },
  inputBar: { display: 'flex', gap: 8, padding: '8px 0' },
  chatInput: { flex: 1, padding: '12px 14px', border: 'none', borderRadius: 20, background: colors.surface, color: colors.textPrimary, fontSize: 14, outline: 'none' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, border: 'none', background: colors.primary, color: '#fff', fontSize: 18, cursor: 'pointer', flexShrink: 0 },
};
