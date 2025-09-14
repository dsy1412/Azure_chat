'use client';

import { ChatMessage } from '@/types/chat';
import { formatTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { User, Bot, Image as ImageIcon } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn(
      'flex gap-3 p-4',
      isUser ? 'justify-end' : 'justify-start'
    )}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        'max-w-[70%] rounded-lg px-4 py-2',
        isUser 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-900 border'
      )}>
        {/* Display images if present */}
        {message.hasImages && message.images && message.images.length > 0 && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center gap-2 text-sm opacity-70">
              <ImageIcon className="w-4 h-4" />
              <span>{message.images.length} image(s) uploaded</span>
            </div>
            <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
              {message.images.map((imageBase64, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden">
                  <img
                    src={`data:image/jpeg;base64,${imageBase64}`}
                    alt={`Uploaded image ${index + 1}`}
                    className="w-full h-auto max-h-48 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div className={cn(
          'text-xs mt-2 opacity-70',
          isUser ? 'text-right' : 'text-left'
        )}>
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}
