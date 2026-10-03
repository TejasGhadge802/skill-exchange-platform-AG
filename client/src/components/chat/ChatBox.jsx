import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip } from 'lucide-react';
import MessageList from './MessageList';
import TypingIndicator from './TypingIndicator';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';

const ChatBox = ({ conversationId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const { socket } = useSocket();
  const typingTimeoutRef = useRef(null);

  // Fetch initial message history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}/messages`);
        if (res.data.success) {
          setMessages(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load message history:', err);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // Handle Socket.IO room lifecycle
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_conversation', conversationId);

    socket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on('user_typing', (data) => {
      if (data.userId !== currentUserId) {
        setTypingUsers((prev) => {
          if (!prev.some((u) => u.userId === data.userId)) {
            return [...prev, data];
          }
          return prev;
        });
      }
    });

    socket.on('user_stopped_typing', (data) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== data.userId));
    });

    return () => {
      socket.emit('leave_conversation', conversationId);
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, [socket, conversationId, currentUserId]);

  const handleTyping = (e) => {
    setText(e.target.value);

    if (socket) {
      socket.emit('typing_start', { conversationId });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { conversationId });
      }, 2000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !socket) return;

    socket.emit('send_message', {
      conversationId,
      text: text.trim(),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit('typing_stop', { conversationId });

    setText('');
  };

  return (
    <div className="flex flex-col h-[500px] sm:h-[600px] bg-slate-50/50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <MessageList messages={messages} currentUserId={currentUserId} />
      <TypingIndicator typingUsers={typingUsers} />

      <form onSubmit={handleSend} className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          placeholder="Type a message or discuss milestone terms..."
          className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 transition shadow-sm"
          aria-label="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;

