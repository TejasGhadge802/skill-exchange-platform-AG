import React, { useRef, useEffect } from 'react';

const MessageList = ({ messages, currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-xs text-slate-400 dark:text-slate-500">
          Start the conversation below. Agree on terms to initiate escrow payment.
        </div>
      ) : (
        messages.map((msg) => {
          const isMe = msg.senderId?._id?.toString() === currentUserId?.toString() || msg.senderId === currentUserId;

          return (
            <div
              key={msg._id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-end gap-1.5 max-w-[80%] sm:max-w-[70%]">
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {msg.senderId?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-700 rounded-bl-xs'
                  }`}
                >
                  {!isMe && (
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-400 mb-0.5">
                      {msg.senderId?.displayName}
                    </span>
                  )}
                  <p className={isMe ? 'text-white' : 'text-slate-800 dark:text-slate-100'}>{msg.text}</p>
                </div>
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 px-1 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;

