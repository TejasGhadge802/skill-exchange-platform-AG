import React from 'react';

const TypingIndicator = ({ typingUsers = [] }) => {
  if (!typingUsers.length) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs text-slate-500 italic">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
      </div>
      <span>
        {typingUsers.map((u) => u.displayName).join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
      </span>
    </div>
  );
};

export default TypingIndicator;

