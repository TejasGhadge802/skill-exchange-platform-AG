import React, { useState, useEffect } from 'react';
import { MessageSquare, X, ChevronLeft, Loader, Search, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import ChatBox from './ChatBox';

const FloatingChatWidget = () => {
  const { currentUser, userProfile } = useAuth();
  const { socket } = useSocket();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch all conversations
  const fetchConversations = async () => {
    if (!currentUser) return;
    try {
      setLoadingConvs(true);
      const res = await api.get('/conversations');
      if (res.data.success) {
        setConversations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setLoadingConvs(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchConversations();
    }
  }, [currentUser, isOpen]);

  // Listen for global custom event to open chat widget for a specific conversation
  useEffect(() => {
    const handleOpenChat = (e) => {
      const { conversationId, conversation } = e.detail || {};
      setIsOpen(true);
      if (conversation) {
        setActiveConv(conversation);
      } else if (conversationId) {
        const found = conversations.find((c) => c._id === conversationId);
        if (found) {
          setActiveConv(found);
        } else {
          api.get(`/conversations/${conversationId}`).then((res) => {
            if (res.data.success) setActiveConv(res.data.data);
          }).catch(() => {});
        }
      }
    };

    window.addEventListener('open_chat_widget', handleOpenChat);
    return () => window.removeEventListener('open_chat_widget', handleOpenChat);
  }, [conversations]);

  // Socket listener for new messages & updates
  useEffect(() => {
    if (!socket) return;

    const handleConvUpdated = (data) => {
      fetchConversations();
    };

    socket.on('conversation_updated', handleConvUpdated);
    return () => {
      socket.off('conversation_updated', handleConvUpdated);
    };
  }, [socket]);

  // Fetch notifications for unread badge
  useEffect(() => {
    if (!currentUser) return;
    api.get('/notifications').then((res) => {
      if (res.data.success) setUnreadCount(res.data.data.unreadCount || 0);
    }).catch(() => {});
  }, [currentUser, isOpen]);

  if (!currentUser) return null;

  const getOtherParticipant = (conv) => {
    if (!userProfile || !conv) return null;
    const isReq = conv.requesterId?._id === userProfile._id;
    return isReq ? conv.providerId : conv.requesterId;
  };

  const filteredConversations = conversations.filter((c) => {
    const other = getOtherParticipant(c);
    const name = other?.displayName || '';
    const taskTitle = c.taskId?.title || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || taskTitle.toLowerCase().includes(query);
  });

  return (
    <>
      {/* Backdrop for mobile / tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:bg-transparent lg:pointer-events-none transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Half-Screen Rectangular Chat Drawer (Right-aligned, half screen width on large displays) */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 w-full sm:w-[480px] md:w-[540px] lg:w-[50vw] max-w-[650px] bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="chat-drawer-header px-5 py-4 bg-indigo-600 text-white flex items-center justify-between shadow-md">
          {activeConv ? (
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setActiveConv(null)}
                className="chat-header-action-btn p-1.5 rounded-lg hover:bg-indigo-700/80 text-indigo-100 hover:text-white transition"
                title="Back to all conversations"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="chat-avatar-other w-10 h-10 rounded-xl bg-white/10 border border-white/20 font-bold flex items-center justify-center text-white flex-shrink-0">
                {getOtherParticipant(activeConv)?.displayName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm truncate text-white">
                    {getOtherParticipant(activeConv)?.displayName || 'Collaborator'}
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Online" />
                </div>
                <p className="chat-header-subtitle text-xs text-indigo-200 truncate">
                  {activeConv.taskId?.title || 'Workspace'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/50">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-base tracking-tight text-white">Messages & Workspace Chat</h3>
                <p className="chat-header-subtitle text-xs text-indigo-200">Live communication with your collaborators</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            {activeConv && (
              <Link
                to={`/conversations/${activeConv._id}`}
                onClick={() => setIsOpen(false)}
                className="chat-header-action-btn p-1.5 rounded-lg hover:bg-indigo-700/80 text-indigo-100 hover:text-white transition text-xs flex items-center gap-1 font-semibold"
                title="Go to full workspace page"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">Workspace</span>
              </Link>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="chat-header-action-btn p-2 rounded-xl hover:bg-indigo-700/80 text-indigo-100 hover:text-white transition"
              aria-label="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950">
          {activeConv ? (
            /* Active Chat Window using full ChatBox */
            <div className="flex-1 flex flex-col min-h-0 p-4">
              <ChatBox
                conversationId={activeConv._id}
                currentUserId={userProfile?._id}
              />
            </div>
          ) : (
            /* Conversation List */
            <div className="flex-1 flex flex-col min-h-0">
              {/* Search Bar */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by user or task name..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {loadingConvs ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
                    <Loader className="w-6 h-6 animate-spin text-indigo-600" />
                    <p className="text-xs">Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400 text-center px-6 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No conversations yet</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                        Apply to tasks or accept proposals to start chatting with collaborators!
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredConversations.map((conv) => {
                    const other = getOtherParticipant(conv);
                    const isRequester = conv.requesterId?._id === userProfile?._id;

                    return (
                      <button
                        key={conv._id}
                        onClick={() => setActiveConv(conv)}
                        className="w-full p-4 flex items-center gap-3.5 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xs transition text-left group"
                      >
                        <div className="chat-user-avatar-list w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white font-black text-base flex items-center justify-center shadow-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          {other?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                              {other?.displayName || 'User'}
                            </h4>
                            <span className="text-[10px] font-semibold text-slate-400 flex-shrink-0">
                              {conv.lastMessageAt
                                ? new Date(conv.lastMessageAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : ''}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md truncate max-w-[160px]">
                              {conv.taskId?.title || 'Task'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {isRequester ? 'Provider' : 'Requester'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {conv.lastMessage || 'No messages yet. Click to start chatting!'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Widget Button (Bottom Right Corner) */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="chat-floating-trigger-btn fixed bottom-6 right-6 z-40 px-4 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl shadow-indigo-600/40 flex items-center gap-2.5 transition-all hover:scale-105 active:scale-95 group"
        aria-label="Open chat"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5" />
          {unreadCount > 0 && !isOpen && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
        <span className="font-bold text-xs tracking-wide hidden sm:inline">
          {isOpen ? 'Close Chat' : 'Messages'}
        </span>
      </button>
    </>
  );
};

export default FloatingChatWidget;
