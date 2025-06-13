import React from 'react';
import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.type === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser 
            ? 'bg-gradient-to-br from-green-400 to-green-600' 
            : 'bg-gradient-to-br from-purple-500 to-blue-600'
        }`}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Bot size={16} className="text-white" />
          )}
        </div>
        
        <div className={`rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm border ${
          isUser
            ? 'bg-gradient-to-br from-green-500/20 to-green-400/20 border-green-500/30 text-green-100'
            : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 text-gray-100'
        }`}>
          <p className="text-sm leading-relaxed font-mono">{message.content}</p>
          <span className="text-xs opacity-60 mt-1 block">
            {message.timestamp.toLocaleTimeString('tr-TR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
      </div>
    </div>
  );
};