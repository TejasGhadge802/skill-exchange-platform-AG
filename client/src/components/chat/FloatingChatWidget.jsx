import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, ChevronDown, Send, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const FloatingChatWidget = () => {
  const { currentUser, userProfile } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);

  // Fetch conversations when widget opens
  useEffect(() => {
    if (!isOpen || !currentUser) return;
    const fetchConvs = async () => {
      setLoadingConvs(true);
      try {
        const res = await api.get('/conversations/my');
        if (res.data.success) setConversations(res.data.data);
      } catch (e) { /* silent */ }
      finally { setLoadingConvs(false); }
    };
    fetchConvs();
  }, [isOpen, currentUser]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConv) return;
    const fetchMsgs = async () => {
      try {
        const res = await api.get(`/conversations/${activeConv._id}/messages`);
        if (res.data.success) setMessages(res.data.data);
      } catch (e) { /* silent */ }
    };
    fetchMsgs();
  }, [activeConv]);

  // Real-time messages via socket
  useEffect(() => {
    if (!socket || !activeConv) return;
    socket.emit('join_conversation', activeConv._id);
    const handler = (msg) => {
      if (msg.conversationId === activeConv._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };
    socket.on('new_message', handler);
    return () => {
      socket.off('new_message', handler);
      socket.emit('leave_conversation', activeConv._id);
    };
  }, [socket, activeConv]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Unread badge: count unseen notifications
  useEffect(() => {
    if (!currentUser) return;
    api.get('/notifications').then((res) => {
      if (res.data.success) setUnreadCount(res.data.data.unreadCount || 0);
    }).catch(() => {});
  }, [currentUser, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeConv) return;
    setSendingMsg(true);
    try {
      await api.post(`/conversations/${activeConv._id}/messages`, { content: newMsg.trim() });
      setNewMsg('');
    } catch (e) { /* silent */ }
    finally { setSendingMsg(false); }
  };

  if (!currentUser) return null;

  const otherParticipant = (conv) => {
    if (!userProfile) return null;
    return conv.requesterId?._id === userProfile._id ? conv.providerId : conv.requesterId;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Panel */}
      {isOpen && (
        <div className="w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
          style={{ height: '480px' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-white">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="font-bold text-sm">
                {activeConv ? (otherParticipant(activeConv)?.displayName || 'Chat') : 'Messages'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeConv && (
                <button onClick={() => { setActiveConv(null); setMessages([]); }}
                  className="text-indigo-200 hover:text-white transition p-1 rounded">
                  <ChevronDown className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-indigo-200 hover:text-white transition p-1 rounded">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!activeConv ? (
            /* Conversation List */
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="flex items-center justify-center h-full text-slate-400">
                  <Loader className="w-5 h-5 animate-spin" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm px-4 text-center gap-2">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                  <p>No conversations yet.</p>
                  <p className="text-xs">Apply to a task to start chatting with a requester!</p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {conversations.map((conv) => {
                    const other = otherParticipant(conv);
                    return (
                      <li key={conv._id}>
                        <button onClick={() => setActiveConv(conv)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left">
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center flex-shrink-0">
                            {other?.displayName?.charAt(0) || '?'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{other?.displayName || 'Unknown'}</p>
                            <p className="text-xs text-slate-400 truncate">{conv.taskId?.title || 'Task Chat'}</p>
                          </div>
                          <Link to={`/conversations/${conv._id}`} className="ml-auto text-xs text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                            onClick={() => setIsOpen(false)}>
                            Open ↗
                          </Link>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          ) : (
            /* Message View */
            <>
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50">
                {messages.map((msg, i) => {
                  const isOwn = msg.senderId?._id === userProfile?._id || msg.senderId === userProfile?._id;
                  return (
                    <div key={msg._id || i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        isOwn ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 px-3 py-2 border-t border-slate-100 bg-white">
                <input
                  type="text"
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button type="submit" disabled={sendingMsg || !newMsg.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl shadow-indigo-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 relative"
        aria-label="Open chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default FloatingChatWidget;
